import { useCallback, useState } from "react";
import React from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { deleteImageFromCloudinary, uploadMedia } from "./cloudinary-upload";
import { IImageModel } from "../interfaces/image-interface";

// Default image URLs for profile, trip, and group (adjust as needed)
const DEFAULT_PROFILE_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1742156351/profile_images/tpyngwygeoykeur0hgre.jpg`;
const DEFAULT_PROFILE_IMAGE_ID = "profile_images/tpyngwygeoykeur0hgre";
const DEFAULT_GROUP_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1745951012/group-defoult_m0jeov.jpg`;
const DEFAULT_GROUP_IMAGE_ID = "group-defoult_m0jeov";

const DEFAULT_TRIP_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1742664563/trip_images/pxn2u29twifmjcjq7whv.png`;
const DEFAULT_TRIP_IMAGE_ID = "trip_images/pxn2u29twifmjcjq7whv";
interface MainImageProps {
  initialImage: IImageModel;
  size?: number;
  id: string;
  uploadType?: "profile" | "trip" | "group";
  /** When false, disables clicking/upload functionality */
  editable?: boolean;
}

const ProfileImage: React.FC<MainImageProps> = ({
  initialImage,
  size = 100,
  id,
  uploadType = "profile",
  editable = true,
}) => {
  const [image, setImage] = useState<IImageModel>(initialImage);
  const [uploading, setUploading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [viewImageVisible, setViewImageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mongoId, setMongoUser, mongoUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      setErrorMessage(null);
    }, [])
  );

  /**
   * Upload media from the front end using uploadMedia function,
   * then update the record in the backend using the update route.
   */
  const uploadMediaToBackend = async (uri: string) => {
    setUploading(true);
    try {
      // Determine folder based on upload type.
      const folder =
        uploadType === "trip"
          ? "trip_images"
          : uploadType === "group"
            ? "group_images"
            : "profile_images";

      // Upload media directly to Cloudinary.
      const mediaResult = await uploadMedia(uri, "image", folder);
      if (!mediaResult) {
        throw new Error("Media upload failed.");
      }

      // Build backend update URL.
      const backendUrl = process.env.EXPO_LOCAL_SERVER as string;
      let requestUrl: string;
      if (uploadType === "trip") {
        requestUrl = `${backendUrl}/api/trips/${id}/update`;
      } else if (uploadType === "group") {
        requestUrl = `${backendUrl}/api/group/${id}/update`;
      } else {
        requestUrl = `${backendUrl}/api/user/${id}/update`;
      }

      // Prepare payload with the appropriate key.
      const updatePayload =
        uploadType === "trip" || uploadType === "group"
          ? { main_image: mediaResult, updated_by: mongoId }
          : { profile_picture: mediaResult };

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // If the update fails, remove the uploaded image from Cloudinary.
        if (mediaResult.delete_token) {
          try {
            await deleteImageFromCloudinary(mediaResult.delete_token);
          } catch (err) {
            console.error("Error removing image from Cloudinary:", err);
          }
        }
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const updatedResponse = await response.json();

      if (uploadType === "trip" || uploadType === "group") {
        setImage(updatedResponse.main_image);
      } else {
        setImage(updatedResponse.profile_picture);
        // setMongoUser(updatedResponse);
      }
      setErrorMessage(null);
    } catch (error: any) {
      console.error("Media upload error:", error);
      setErrorMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Handle image press: if editable, show tooltip; if not, view image.
  const onImagePress = () => {
    if (uploading) return;
    if (editable) {
      setTooltipVisible(true);
    } else {
      setViewImageVisible(true);
    }
  };

  // Request permission and launch image picker.
  const handleImageChange = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Media library permissions are required to pick an image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      await handleRemovePhoto();
      await uploadMediaToBackend(asset.uri);
    } else {
      console.log("No image selected.");
    }
  };

  const deletImage = async () => {
    if (image?.delete_token) {
      try {
        await deleteImageFromCloudinary(image.delete_token);
      } catch (err) {
        console.error("Error removing image from Cloudinary:", err);
      }
    }
  };
  // Remove the current photo via DELETE endpoint.
  const handleRemovePhoto = async () => {
    try {
      setUploading(true);
      const backendUrl =
        (process.env.EXPO_LOCAL_SERVER as string) ||
        "http://192.168.1.100:3000";
      let requestUrl: string;
      let defaultImage: IImageModel;
      if (uploadType === "trip") {
        requestUrl = `${backendUrl}/api/trips/${id}/update`;
        defaultImage = {
          url: DEFAULT_TRIP_IMAGE_URL,
          image_id: DEFAULT_TRIP_IMAGE_ID,
          type: "image",
        };
      } else if (uploadType === "group") {
        requestUrl = `${backendUrl}/api/group/${id}/update`;
        defaultImage = {
          url: DEFAULT_GROUP_IMAGE_URL,
          image_id: DEFAULT_GROUP_IMAGE_ID,
          type: "image",
        };
      } else {
        requestUrl = `${backendUrl}/api/user/${id}/update`;
        defaultImage = {
          url: DEFAULT_PROFILE_IMAGE_URL,
          image_id: DEFAULT_PROFILE_IMAGE_ID,
          type: "image",
        };
      }

      // Send update request to backend
      const updatePayload =
        uploadType === "trip" || uploadType === "group"
          ? { main_image: defaultImage, updated_by: mongoId }
          : { profile_picture: defaultImage };

      const response = await fetch(requestUrl, {
        method: "POST", // or PUT if your route is set that way
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const updatedModel = await response.json();

      // After successfully updating the backend, remove the old image from Cloudinary.

      // Update UI based on type.
      if (uploadType === "trip" || uploadType === "group") {
        deletImage();
        setImage(updatedModel.main_image.url);
      } else {
        deletImage();
        setImage(updatedModel.profile_picture.url);
        // setMongoUser(newData);
      }
      setTooltipVisible(false);
    } catch (error: any) {
      console.error("Error removing photo:", error);
      setErrorMessage("Failed to remove photo.");
    } finally {
      setUploading(false);
    }
  };

  // Determine the default URL based on uploadType.
  const defaultUrl =
    uploadType === "trip"
      ? DEFAULT_TRIP_IMAGE_URL
      : uploadType === "group"
        ? DEFAULT_GROUP_IMAGE_URL
        : DEFAULT_PROFILE_IMAGE_URL;

  return (
    <>
      <View className="items-center ml-2">
        <View className="relative">
          <Pressable
            onPress={onImagePress}
            disabled={uploading}
            className="items-center justify-center"
            style={{ width: size * 1.2, height: size * 1.2 }}
          >
            {/* Image container with circular clipping */}
            <View
              className="overflow-hidden"
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
                    image.url
                      ? { uri: image.url }
                      : require("../assets/default-profile.png")
                  }
                  className="w-full h-full rounded-full"
                />
              )}
            </View>

            {/* Pencil icon positioned outside the clipped container */}
            {editable && !uploading && (
              <View className="absolute bottom-0 right-0">
                <View className="bg-black/60 rounded-full p-1">
                  <Ionicons name="pencil" size={16} color="white" />
                </View>
              </View>
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

      {/* Tooltip Modal (only for editable images) */}
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

                  handleImageChange();
                }}
              >
                <Text className="text-lg text-blue-500 text-center">
                  Change{" "}
                  {uploadType === "trip"
                    ? "Trip"
                    : uploadType === "group"
                      ? "Group"
                      : "Profile"}{" "}
                  Pic
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
              {/* Show "Remove Photo" option if current image is not the default */}
              {image.url !== defaultUrl && (
                <TouchableOpacity className="py-2" onPress={handleRemovePhoto}>
                  <Text className="text-lg text-blue-500 text-center">
                    Remove Photo
                  </Text>
                </TouchableOpacity>
              )}
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
              image
                ? { uri: image.url }
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
