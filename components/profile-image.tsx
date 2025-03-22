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

interface MainImageProps {
  initialImageUrl: string;
  size?: number;
  id: string;
  uploadType?: "profile" | "trip";
  /** When false, disables clicking/upload functionality */
  editable?: boolean;
}

const ProfileImage: React.FC<MainImageProps> = ({
  initialImageUrl,
  size = 100,
  id,
  uploadType = "profile",
  editable = true,
}) => {
  const [imageUri, setImageUri] = useState<string>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [viewImageVisible, setViewImageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setMongoUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      setErrorMessage(null);
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
      let requestUrl: string;

      if (uploadType === "trip") {
        requestUrl = `${backendUrl}/api/trips/${id}/upload-profile-picture`;
      } else {
        requestUrl = `${backendUrl}/api/user/${id}/upload-profile-picture`;
      }

      console.log("Sending request to:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const updatedResponse = await response.json();
      console.log("Upload successful:", updatedResponse);

      // Use the appropriate property based on the upload type.
      if (uploadType === "trip") {
        if (updatedResponse.main_image && updatedResponse.main_image.url) {
          setImageUri(updatedResponse.main_image.url);
        } else {
          throw new Error("Trip image URL not found in response");
        }
      } else {
        if (
          updatedResponse.profile_picture &&
          updatedResponse.profile_picture.url
        ) {
          setImageUri(updatedResponse.profile_picture.url);
          setMongoUser(updatedResponse);
        } else {
          throw new Error("Profile image URL not found in response");
        }
      }
      setErrorMessage(null);
    } catch (error: any) {
      console.error("Backend upload error:", error);
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      console.log("Image selected:", asset.uri);
      setUploading(true);
      await uploadImageToBackend(asset.uri);
    } else {
      console.log("No image selected.");
    }
  };

  // Only allow press if editable is true and we're not uploading.
  const onImagePress = () => {
    if (editable && !uploading) {
      setTooltipVisible(true);
    }
  };

  return (
    <>
      <View className="items-center ml-2">
        <View className="relative">
          <Pressable
            onPress={editable ? onImagePress : undefined}
            disabled={!editable || uploading}
            className="items-center justify-center overflow-hidden"
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

          {errorMessage && (
            <Text
              style={{
                top: size * 1.2 + 4,
                width: size * 1.2 * 1.5,
                left: -(size * 1.2) * 0.25,
              }}
              className="absolute text-red-500 text-center"
            >
              {errorMessage}
            </Text>
          )}
        </View>
      </View>

      {/* Tooltip Modal */}
      {editable && (
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
                  Change {uploadType === "trip" ? "Trip" : "Profile"} Pic
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
      )}

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
