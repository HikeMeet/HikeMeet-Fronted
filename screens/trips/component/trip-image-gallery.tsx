import { useState } from "react";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  deleteImageFromCloudinary,
  uploadMedia,
} from "../../../components/cloudinary-upload";
import { IImageModel } from "../../../interfaces/image-interface";
import FullScreenMediaModal from "../../../components/media-fullscreen-modal";

interface ImageItem extends IImageModel {}

interface TripImagesUploaderProps {
  tripId: string;
  enabled?: boolean;
  initialImages?: ImageItem[];
  /** Callback when images are updated, if needed */
  onImagesUpdated?: (images: ImageItem[]) => void;
}

const MAX_IMAGE_COUNT = 5;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const TripImagesUploader: React.FC<TripImagesUploaderProps> = ({
  tripId,
  initialImages = [],
  enabled = true,
  onImagesUpdated,
}) => {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);

  const pickImages = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Media library permissions are required to upload images.");
        return;
      }
      // Allow all media types (images & videos)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (images.length + result.assets.length > MAX_IMAGE_COUNT) {
          alert(`Cannot upload more than ${MAX_IMAGE_COUNT} photos to a trip.`);
          return;
        }
        setUploading(true);
        try {
          // Upload each selected asset to Cloudinary.
          const uploadedImages = await Promise.all(
            result.assets.map((asset) =>
              uploadMedia(
                asset.uri,
                asset.type as "image" | "video",
                "trip_images"
              )
            )
          );
          // Filter out any unsuccessful uploads.
          const validUploadedImages = uploadedImages.filter(
            (img): img is ImageItem => img !== null
          );
          // Append the new images using the $push operator.
          const backendUrl =
            process.env.EXPO_LOCAL_SERVER || "http://192.168.1.100:3000";
          const requestUrl = `${backendUrl}/api/trips/${tripId}/update`;
          const response = await fetch(requestUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              $push: { images: { $each: validUploadedImages } },
            }),
          });
          if (!response.ok) {
            const errorText = await response.text();
            for (const img of validUploadedImages) {
              if (img.delete_token) {
                try {
                  await deleteImageFromCloudinary(img.delete_token);
                } catch (err) {
                  console.error("Error removing image from Cloudinary:", err);
                }
              }
            }
            alert(`Upload failed: ${errorText}`);
          } else {
            const updatedTrip = await response.json();
            if (updatedTrip.images) {
              setImages(updatedTrip.images);
              if (onImagesUpdated) {
                onImagesUpdated(updatedTrip.images);
              }
            }
          }
        } catch (error) {
          console.error("Error uploading images:", error);
          alert("Error uploading images.");
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking images:", error);
    }
  };

  const openFullScreen = (index: number) => {
    setSelectedMediaIndex(index);
    setMediaModalVisible(true);
  };

  const toggleDeleteMode = () => {
    if (!isDeleting) {
      setIsDeleting(true);
      setSelectedForDeletion([]);
    } else {
      setIsDeleting(false);
      setSelectedForDeletion([]);
    }
  };

  const toggleSelection = (imageId: string) => {
    if (selectedForDeletion.includes(imageId)) {
      setSelectedForDeletion(
        selectedForDeletion.filter((id) => id !== imageId)
      );
    } else {
      setSelectedForDeletion([...selectedForDeletion, imageId]);
    }
  };

  // Deletion flow remains unchanged.
  const handleDeleteSelectedImages = async () => {
    try {
      const backendUrl =
        process.env.EXPO_LOCAL_SERVER || "http://192.168.1.100:3000";
      const requestUrl = `${backendUrl}/api/trips/${tripId}/update`;

      // Build update payload using $pull operator to remove images from the array.
      const updatePayload = {
        $pull: { images: { image_id: { $in: selectedForDeletion } } },
      };

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Deletion failed: ${errorText}`);
      } else {
        const updatedTrip = await response.json();
        setImages(updatedTrip.images);
        if (onImagesUpdated) {
          onImagesUpdated(updatedTrip.images);
        }

        // Loop through selectedForDeletion array and delete each image from Cloudinary.
        // Use the local images state to find the corresponding delete token.
        for (const id of selectedForDeletion) {
          const imageToDelete = images.find((img) => img.image_id === id);
          if (imageToDelete?.delete_token) {
            try {
              await deleteImageFromCloudinary(imageToDelete.delete_token);
            } catch (err) {
              console.error("Error removing image from Cloudinary:", err);
            }
          }
        }
        setIsDeleting(false);
        setSelectedForDeletion([]);
      }
    } catch (error) {
      console.error("Error deleting images:", error);
      alert("Error deleting images.");
    }
  };

  return (
    <>
      {uploading ? (
        <View className="w-40 h-40 bg-gray-300 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : images.length === 0 ? (
        enabled ? (
          <TouchableOpacity
            onPress={pickImages}
            className="bg-gray-300 w-40 h-40 justify-center items-center"
          >
            <Text className="text-gray-700 text-center">
              Click to upload images or videos
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="bg-gray-300 w-40 h-40 justify-center items-center">
            <Text className="text-gray-700 text-center">No Media</Text>
          </View>
        )
      ) : (
        <View className="flex-row items-center">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1"
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (isDeleting) {
                    toggleSelection(img.image_id);
                  } else {
                    openFullScreen(index);
                  }
                }}
                className="relative mr-2"
              >
                <Image
                  source={{
                    uri:
                      img.type === "video" && img.video_sceenshot_url
                        ? img.video_sceenshot_url
                        : img.url,
                  }}
                  className="w-20 h-20 rounded"
                  style={
                    isDeleting ? { borderWidth: 2, borderColor: "red" } : {}
                  }
                />
                {isDeleting && selectedForDeletion.includes(img.image_id) && (
                  <View className="absolute top-0 right-0 bg-red-500 rounded-full p-1">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          {enabled && (
            <View className="flex-col ml-2">
              <TouchableOpacity
                onPress={pickImages}
                className="bg-blue-500 w-6 h-6 rounded-full mb-2 justify-center items-center"
              >
                <Text className="text-white text-xl">+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleDeleteMode}
                className="bg-yellow-500 w-6 h-6 rounded-full justify-center items-center"
              >
                <Text className="text-white text-xl">-</Text>
              </TouchableOpacity>
              {isDeleting && selectedForDeletion.length > 0 && (
                <TouchableOpacity
                  onPress={handleDeleteSelectedImages}
                  className="bg-red-500 w-6 h-6 rounded-full mt-2 justify-center items-center"
                >
                  <Ionicons name="trash" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {/* Fullscreen Modal for Media Preview */}
      <Modal
        visible={mediaModalVisible}
        animationType="slide"
        onRequestClose={() => setMediaModalVisible(false)}
      >
        <FullScreenMediaModal
          media={images}
          initialIndex={selectedMediaIndex}
          onClose={() => setMediaModalVisible(false)}
        />
      </Modal>
    </>
  );
};

export default TripImagesUploader;
