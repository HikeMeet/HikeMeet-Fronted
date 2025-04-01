import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth-context";
import { uploadMedia } from "../../components/cloudinary-upload";
import { IImageModel } from "../../interfaces/image-interface";
import SelectedMediaList, {
  ILocalMedia,
} from "../../components/media-list-in-before-uploading";

const CreatePostPage: React.FC<any> = ({ navigation }) => {
  const [content, setContent] = useState("");
  // Store locally selected media (not yet uploaded)
  const [selectedMedia, setSelectedMedia] = useState<ILocalMedia[]>([]);
  // State for uploaded media (IMediaItem)
  const [uploadedMedia, setUploadedMedia] = useState<IImageModel[]>([]);
  const [uploading, setUploading] = useState(false);
  const { mongoId } = useAuth();

  // Allow multiple selection from gallery
  const pickMedia = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access media is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true, // enable multiple selection
    });

    if (!result.canceled) {
      // result.assets is an array when multiple selection is enabled
      const newMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === "video" ? "video" : "image",
      }));
      setSelectedMedia((prev: any) => [...prev, ...newMedia]);
    }
  };

  // Remove a selected media item
  const removeSelectedMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit the post and upload media
  const submitPost = async () => {
    setUploading(true);
    let uploadedItems: IImageModel[] = [];
    try {
      if (selectedMedia.length > 0) {
        for (const media of selectedMedia) {
          const uploaded = await uploadMedia(media.uri, media.type);
          if (uploaded) {
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
        Alert.alert("Success", "Post created successfully.");
        navigation.replace("PostPage", { postId: result.post._id });
      } else {
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
        <TextInput
          className="border border-gray-300 p-3 rounded mb-4 min-h-[100px]"
          multiline
          placeholder="What's on your mind?"
          value={content}
          onChangeText={setContent}
        />
        <SelectedMediaList
          media={selectedMedia}
          onRemove={removeSelectedMedia}
        />
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
    </SafeAreaView>
  );
};

export default CreatePostPage;
