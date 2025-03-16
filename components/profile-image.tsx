// components/ProfileImage.tsx
import React, { useState } from "react";
import { Image, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/auth-context";

interface ProfileImageProps {
  initialImageUrl: string;
  size?: number;
  userId: string; // User ID to update the profile on the backend
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  initialImageUrl,
  size = 100,
  userId,
}) => {
  const [imageUri, setImageUri] = useState<string>(initialImageUrl);
  const { setMongoUser } = useAuth();

  // Upload the image to your backend endpoint.
  const uploadImageToBackend = async (uri: string) => {
    const formData = new FormData();
    console.log("Uploading file with URI:", uri);
    // Append the image file to the form data.
    formData.append("image", {
      uri,
      type: "image/jpeg", // adjust if necessary based on file type
      name: "upload.jpg",
    } as any);

    try {
      const backendUrl =
        (process.env.EXPO_LOCAL_SERVER as string) ||
        "http://192.168.1.100:3000";
      const requestUrl = `${backendUrl}/api/user/${userId}/upload-profile-picture`;
      console.log("Sending request to:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const updatedUser = await response.json();
      console.log("Upload successful:");
      setMongoUser(updatedUser);
      setImageUri(updatedUser.profile_picture.url);
      // Optionally update state or notify user.
    } catch (error: any) {
      console.error("Backend upload error:", error);
      Alert.alert("Upload Error", "Failed to upload image to server.");
    }
  };

  const handlePress = async () => {
    // Request media library permissions.
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Media library permissions are required to pick an image."
      );
      return;
    }

    // Launch the image picker.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    // If the picker wasn't canceled and an asset is returned.
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      console.log("Image selected:", asset.uri);
      // Update UI with the chosen image.
      // Send the image to the backend.
      await uploadImageToBackend(asset.uri);
    } else {
      console.log("No image selected.");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Image
        source={
          imageUri
            ? { uri: imageUri }
            : require("../assets/default-profile.png")
        }
        className="w-full h-full rounded-full"
      />
    </Pressable>
  );
};

export default ProfileImage;
