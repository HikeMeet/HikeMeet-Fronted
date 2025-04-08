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
  const [postId, setPostId] = useState<String>("");

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
        attached_trip: null,
        attached_group: null,
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
          } // Add this closing bracket
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
      <ScrollView contentContainerStyle={{ padding: 16 }} className="bg-white">
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
            {/* You may add a Send button here if needed */}
          </View>
        </KeyboardAvoidingView>
        <SelectedMediaList
          media={selectedMedia}
          onRemove={removeSelectedMedia}
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
          // Navigate to the PostPage using the created post's ID
          // (Assuming you have stored it or retrieved it as needed.)
          navigation.replace("PostPage", { postId: postId });
        }}
        onCancel={() => setConfirmationVisible(false)}
      />
    </SafeAreaView>
  );
};

export default CreatePostPage;
