import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth-context";
import {
  deleteImageFromCloudinary,
  uploadMedia,
} from "../../components/cloudinary-upload";
import { IImageModel } from "../../interfaces/image-interface";
import SelectedMediaList, {
  ILocalMedia,
} from "../../components/media-list-in-before-uploading";
import ConfirmationModal from "../../components/confirmation-modal";
import MentionTextInput from "../../components/metion-with-text-input";
import { Group } from "../../interfaces/group-interface";
import { Trip } from "../../interfaces/trip-interface";
import TripRow from "../trips/component/trip-row";
import GroupRow from "../groups/components/group-row";
import { fetchTrips } from "../../components/requests/fetch-trips";
import { fetchGroups } from "../../components/requests/fetch-groups";
import GroupSelectionModal from "../groups/components/group-selection-modal";
import TripSelectionModal from "../trips/component/trip-selection-modal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import SelectedGroupsList from "./components/attached-group-preview";
import SelectedTripsList from "./components/attached-trip-preview";

interface CreatePostPageProps {
  navigation: any;
  route: {
    params: {
      inGroup?: boolean;
      groupId?: string;
    };
  };
}

const CreatePostPage: React.FC<CreatePostPageProps> = ({
  navigation,
  route,
}) => {
  const { inGroup: in_group = false, groupId } = route.params || {};
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ILocalMedia[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<IImageModel[]>([]);
  const [uploading, setUploading] = useState(false);
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const { mongoId } = useAuth();
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [postId, setPostId] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  // Change single selection to multiple selections
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Allow multiple selection from gallery.
  const pickMedia = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      // You can show an alert or handle permission denial here.
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const newMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === "video" ? "video" : "image",
      }));
      setSelectedMedia((prev: any) => [...prev, ...newMedia]);
    }
  };

  // Remove a selected media item.
  const removeSelectedMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch trips or groups and show modal
  const openAttachmentModal = async (type: "trip" | "group") => {
    if (type === "trip") {
      try {
        setLoading(true);
        const response = await fetchTrips();
        setTrips(response);
        setShowTripModal(true);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    } else if (type === "group") {
      try {
        setLoading(true);
        const response = await fetchGroups();
        setGroups(response);
        setShowGroupModal(true);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Remove an attached group from the selectedGroups array.
  const removeGroup = (groupId: string) => {
    setSelectedGroups((prev) => prev.filter((group) => group._id !== groupId));
  };

  // Remove an attached trip from the selectedTrips array.
  const removeTrip = (tripId: string) => {
    setSelectedTrips((prev) => prev.filter((trip) => trip._id !== tripId));
  };

  // Submit the post and upload media.
  const submitPost = async () => {
    setUploading(true);
    let uploadedItems: IImageModel[] = [];
    try {
      if (selectedMedia.length > 0) {
        for (const media of selectedMedia) {
          const uploaded = await uploadMedia(
            media.uri,
            media.type,
            "post_media"
          );
          if (uploaded) {
            console.log("Media uploaded:", uploaded);
            uploadedItems.push(uploaded);
          } else {
            throw new Error("One or more media uploads failed.");
          }
        }
      }
      setUploadedMedia(uploadedItems);

      const postData = {
        author: mongoId,
        content,
        images: uploadedItems || [],
        // Here you can send arrays of ids if your backend supports it.
        attached_trips: selectedTrips.map((trip) => trip._id),
        attached_groups: selectedGroups.map((group) => group._id),
        is_shared: false,
        privacy: in_group ? "private" : privacy, // include privacy option in the postData
        in_group: in_group ? groupId : undefined,
      };

      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        }
      );
      const result = await response.json();
      if (response.ok) {
        console.log("Post created successfully:", result.post._id);
        // Instead of using an alert, show the confirmation modal.
        setPostId(result.post._id);
        setConfirmationVisible(true);
      } else {
        // You may still want to alert on error.
        if (uploadedItems.length > 0) {
          for (const item of uploadedItems) {
            deleteImageFromCloudinary(item.delete_token!);
          }
        }
        Alert.alert("Error", result.error || "Failed to create post.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ padding: 16 }}
        className="bg-white"
      >
        <Text className="text-2xl font-bold mb-4 text-center">
          Create a Post
        </Text>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-white border-t border-gray-200 p-4"
        >
          <View className="flex-row items-center">
            <MentionTextInput
              placeholder="Write a comment..."
              value={content}
              onChangeText={setContent}
              inputStyle={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 8,
                fontSize: 16,
                color: "#374151",
              }}
              containerStyle={{ flex: 1 }}
            />
          </View>
        </KeyboardAvoidingView>
        <SelectedMediaList
          media={selectedMedia}
          onRemove={removeSelectedMedia}
        />

        {/* Attachment Selector Section */}
        <View className="mb-4 p-4 bg-gray-50 rounded">
          <Text className="text-lg font-semibold mb-2">Attach</Text>
          <View className="flex-row">
            {!in_group && (
              <TouchableOpacity
                className="bg-blue-500 p-3 rounded mr-2"
                onPress={() => openAttachmentModal("group")}
              >
                <Text className="text-white">Attach Group</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="bg-green-500 p-3 rounded"
              onPress={() => openAttachmentModal("trip")}
            >
              <Text className="text-white">Attach Trip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview of attached groups */}
        <SelectedGroupsList
          groups={selectedGroups}
          navigation={navigation}
          onRemove={(groupId) => removeGroup(groupId)}
        />

        {/* Preview of attached trips */}
        <SelectedTripsList
          trips={selectedTrips}
          onRemove={(tripId) => removeTrip(tripId)}
          navigation={navigation}
        />
        {/* Privacy Option */}
        {!in_group && (
          <>
            <Text className="text-lg font-semibold mb-2">Privacy:</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                className={`p-3 rounded border ${
                  privacy === "public"
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-gray-300"
                }`}
                onPress={() => setPrivacy("public")}
              >
                <Text
                  className={`${privacy === "public" ? "text-white" : "text-black"}`}
                >
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`p-3 rounded ml-4 border ${
                  privacy === "private"
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-gray-300"
                }`}
                onPress={() => setPrivacy("private")}
              >
                <Text
                  className={`${privacy === "private" ? "text-white" : "text-black"}`}
                >
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity
          className="bg-blue-500 p-3 rounded items-center mb-4"
          onPress={pickMedia}
          disabled={uploading}
        >
          <Text className="text-white">
            {uploading ? "Uploading..." : "Pick Media"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-500 p-3 rounded items-center"
          onPress={submitPost}
          disabled={uploading}
        >
          <Text className="text-white">Submit Post</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmationVisible}
        message="Post created successfully!"
        onConfirm={() => {
          setConfirmationVisible(false);
          navigation.replace("PostPage", { postId: postId });
        }}
        onCancel={() => setConfirmationVisible(false)}
      />

      {showGroupModal && (
        <GroupSelectionModal
          visible={showGroupModal}
          groups={groups}
          onSelect={(group) => {
            // Add the selected group only if it isn’t already added.
            setSelectedGroups((prev) =>
              prev.find((g) => g._id === group._id) ? prev : [...prev, group]
            );
            setShowGroupModal(false);
          }}
          onClose={() => setShowGroupModal(false)}
          navigation={navigation}
        />
      )}

      {showTripModal && (
        <TripSelectionModal
          visible={showTripModal}
          trips={trips}
          onSelect={(trip) => {
            // Add the selected trip only if it isn’t already added.
            setSelectedTrips((prev) =>
              prev.find((t) => t._id === trip._id) ? prev : [...prev, trip]
            );
            setShowTripModal(false);
          }}
          onClose={() => setShowTripModal(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default CreatePostPage;
