import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  Alert,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth-context";
import { uploadMedia } from "../../components/cloudinary-upload";
import { IImageModel } from "../../interfaces/image-interface";
import SelectedMediaList, {
  ILocalMedia,
} from "../../components/media-list-component";

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
        // Optionally, remove uploaded media from Cloudinary if needed
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        style={{ backgroundColor: "white" }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Create a Post
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            minHeight: 100,
          }}
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
          style={{
            backgroundColor: "#3b82f6",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 16,
          }}
          onPress={pickMedia}
          disabled={uploading}
        >
          <Text style={{ color: "white" }}>
            {uploading ? "Uploading..." : "Pick Media"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#10b981",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={submitPost}
          disabled={uploading}
        >
          <Text style={{ color: "white" }}>Submit Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePostPage;
