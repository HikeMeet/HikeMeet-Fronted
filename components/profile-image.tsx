// components/ProfileImage.tsx
import React, { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
  View,
  Modal,
  Text,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";

interface ProfileImageProps {
  initialImageUrl: string;
  size?: number;
  userId: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  initialImageUrl,
  size = 100,
  userId,
}) => {
  const [imageUri, setImageUri] = useState<string>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [viewImageVisible, setViewImageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setMongoUser } = useAuth();
  useFocusEffect(
    useCallback(() => {
      setErrorMessage("Upload failed.");
    }, [])
  );
  const uploadImageToBackend = async (uri: string) => {
    const formData = new FormData();
    console.log("Uploading file with URI:", uri);
    formData.append("image", {
      uri,
      type: "image/jpeg",
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
      setErrorMessage(null); // reset error message on success
    } catch (error: any) {
      //   console.error("Backend upload error:", error);
      setErrorMessage("Upload failed.");
    } finally {
      setUploading(false);
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

    // If an image is selected, start the upload.
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      console.log("Image selected:", asset.uri);
      setUploading(true);
      await uploadImageToBackend(asset.uri);
    } else {
      console.log("No image selected.");
    }
  };

  // When the user taps the profile image, open the tooltip modal.
  const onImagePress = () => {
    if (!uploading) {
      setTooltipVisible(true);
    }
  };

  return (
    <>
      <View className="items-center ml-2">
        {/* Wrap the image and error message in a relative container */}
        <View className="relative">
          <Pressable
            onPress={onImagePress}
            disabled={uploading}
            className="items-center justify-center overflow-hidden"
            // Changed image size: multiply size by 1.2 for a larger image
            style={{
              width: size * 1.2,
              height: size * 1.2,
              borderRadius: (size * 1.2) / 2,
            }}
          >
            {uploading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator />
              </View>
            ) : (
              <Image
                source={
                  imageUri
                    ? { uri: imageUri }
                    : require("../assets/default-profile.png")
                }
                className="w-full h-full rounded-full"
              />
            )}
          </Pressable>

          {/* Error Message positioned absolutely with updated dimensions */}
          {errorMessage && (
            <Text
              style={{
                top: size * 1.2 + 4, // adjust top based on the new image size
                width: size * 1.2 * 1.5, // increase width proportionally
                left: -(size * 1.2) * 0.25, // shift left accordingly
              }}
              className="absolute text-red-500 text-center"
            >
              {errorMessage}
            </Text>
          )}
        </View>
      </View>

      {/* Tooltip Modal */}
      <Modal
        transparent
        visible={tooltipVisible}
        animationType="fade"
        onRequestClose={() => setTooltipVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center items-center"
          activeOpacity={1}
          onPressOut={() => setTooltipVisible(false)}
        >
          <View className="bg-white p-4 rounded-lg min-w-[200px]">
            <TouchableOpacity
              className="py-2"
              onPress={() => {
                setTooltipVisible(false);
                handlePress();
              }}
            >
              <Text className="text-lg text-blue-500 text-center">
                Change Profile Pic
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-2"
              onPress={() => {
                setTooltipVisible(false);
                setViewImageVisible(true);
              }}
            >
              <Text className="text-lg text-blue-500 text-center">
                View Current Image
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fullscreen View Image Modal */}
      <Modal
        transparent={false}
        visible={viewImageVisible}
        animationType="slide"
        onRequestClose={() => setViewImageVisible(false)}
      >
        <View className="flex-1 bg-black justify-center items-center">
          <Pressable
            className="absolute top-10 right-5 bg-white/70 p-2 rounded-full"
            onPress={() => setViewImageVisible(false)}
          >
            <Text className="text-black text-lg">Close</Text>
          </Pressable>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : require("../assets/default-profile.png")
            }
            className="w-full h-4/5"
            resizeMode="contain"
          />
        </View>
      </Modal>
    </>
  );
};

export default ProfileImage;
