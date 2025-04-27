// components/ShareTripModal.tsx

import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styled } from "nativewind";
import { useAuth } from "../../../contexts/auth-context";
import {
  deleteImageFromCloudinary,
  uploadMedia,
} from "../../../components/cloudinary-upload";
import { Trip } from "../../../interfaces/trip-interface";
import SelectedMediaList, {
  ILocalMedia,
} from "../../../components/media-list-in-before-uploading";
import TripRow from "./trip-row";
import { Group } from "../../../interfaces/group-interface";
import { IPost } from "../../../interfaces/post-interface";
import GroupSelectionModal from "../../groups/components/group-selection-modal";
import GroupRow from "../../groups/components/group-row";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface ShareTripModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  trip: Trip;
}

const ShareTripModal: React.FC<ShareTripModalProps> = ({
  visible,
  onClose,
  navigation,
  trip,
}) => {
  const { mongoId } = useAuth();
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ILocalMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  // pick local media
  const pickMedia = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!res.canceled) {
      const newItems = res.assets.map((a) => ({
        uri: a.uri,
        type: a.type === "video" ? "video" : "image",
      }));
      setSelectedMedia((prev: any) => [...prev, ...newItems]);
    }
  };
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const res = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/group/user/${mongoId}`
        );
        if (!res.ok) throw new Error("Failed to load groups");
        const { groups: userGroups } = await res.json();
        setGroups(userGroups);
      } catch (err) {
        console.error("Error loading groups:", err);
      }
    };
    fetchUserGroups();
  }, [mongoId]);
  // remove from local list
  const removeLocalMedia = (idx: number) =>
    setSelectedMedia((prev) => prev.filter((_, i) => i !== idx));

  // main share logic: upload + create post + navigate
  const handleShare = async () => {
    if (!trip._id) return;
    setUploading(true);

    const uploadedImages: any[] = [];
    try {
      // 1) upload media
      for (const m of selectedMedia) {
        const img = await uploadMedia(m.uri, m.type, "post_media");
        if (img) uploadedImages.push(img);
      }

      // 2) create the share-trip post
      const body: any = {
        author: mongoId,
        content,
        images: uploadedImages,
        attached_trips: [trip._id],
        type: "share_trip",
        is_shared: true,
        privacy: "public",
      };
      if (selectedGroup) {
        body.in_group = selectedGroup._id;
      }
      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Share failed");

      // 3) navigate to the new post
      onClose();
      navigation.replace("PostStack", {
        screen: "PostPage",
        params: { postId: data.post._id },
      });
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Could not share trip");
      // cleanup any half‐uploaded images
      for (const img of uploadedImages) {
        if (img.delete_token) deleteImageFromCloudinary(img.delete_token);
      }
    } finally {
      setUploading(false);
      setContent("");
      setSelectedMedia([]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl max-h-[80%] min-h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">Share Trip</Text>
            <TouchableOpacity
              onPress={() => {
                onClose();
                setSelectedGroup(null);
                setSelectedMedia([]);
                setContent("");
                setShowGroupModal(false);
              }}
            >
              <Text className="text-blue-500">Cancel</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
          >
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {/* Trip preview */}
              {trip && <TripRow trip={trip} onPress={() => {}} />}
              {/* — Share to a Group (optional) — */}
              <View className="mb-4">
                <Text className="font-semibold mb-2">
                  Share into Group (optional):
                </Text>
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity
                    onPress={() => setShowGroupModal(true)}
                    className="flex-1"
                  >
                    {selectedGroup ? (
                      <GroupRow
                        group={selectedGroup}
                        navigation={navigation}
                        onPress={() => setShowGroupModal(true)}
                      />
                    ) : (
                      <View className="flex-row items-center p-2 rounded border border-gray-300">
                        <Text className="text-gray-500">Select a group…</Text>
                        <Icon name="chevron-right" size={20} color="#6B7280" />
                      </View>
                    )}
                  </TouchableOpacity>
                  {selectedGroup && (
                    <TouchableOpacity
                      onPress={() => setSelectedGroup(null)}
                      className="p-2"
                    >
                      <Icon name="delete" size={20} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {/* Content input */}
              <TextInput
                placeholder="Add a comment..."
                value={content}
                onChangeText={setContent}
                multiline
                className="border border-gray-300 rounded p-2 h-24 mb-4"
              />

              {/* Selected media preview */}
              <SelectedMediaList
                media={selectedMedia}
                onRemove={removeLocalMedia}
              />

              {/* Pick more media */}
              <TouchableOpacity
                onPress={pickMedia}
                className="bg-blue-500 p-3 rounded mb-4 items-center"
                disabled={uploading}
              >
                <Text className="text-white">Add Media</Text>
              </TouchableOpacity>

              {/* Share button */}
              <TouchableOpacity
                onPress={handleShare}
                className="bg-green-500 p-3 rounded items-center"
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white">Share</Text>
                )}
              </TouchableOpacity>
              {showGroupModal && (
                <GroupSelectionModal
                  visible={showGroupModal}
                  groups={groups}
                  onSelect={(g) => {
                    setSelectedGroup(g);
                    setShowGroupModal(false);
                  }}
                  onClose={() => setShowGroupModal(false)}
                  navigation={navigation}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

export default styled(ShareTripModal);
