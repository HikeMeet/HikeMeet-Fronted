// components/TripImagesUploader.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImageItem {
  url: string;
  image_id: string;
}

interface TripImagesUploaderProps {
  tripId: string;
  initialImages?: ImageItem[];
  /** Callback when images are updated, if needed */
  onImagesUpdated?: (images: ImageItem[]) => void;
}

const MAX_IMAGE_COUNT = 5;

const TripImagesUploader: React.FC<TripImagesUploaderProps> = ({
  tripId,
  initialImages = [],
  onImagesUpdated,
}) => {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    try {
      // Request media library permissions.
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Media library permissions are required to upload images.");
        return;
      }

      // Launch the image picker with multiple selection enabled.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // Supported on iOS 14+; Android may allow one at a time
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Ensure total images do not exceed the max allowed.
        if (images.length + result.assets.length > MAX_IMAGE_COUNT) {
          alert(`Cannot upload more than ${MAX_IMAGE_COUNT} photos to a trip.`);
          return;
        }

        // Create a FormData instance and append each selected file.
        const formData = new FormData();
        result.assets.forEach((asset, index) => {
          formData.append("images", {
            uri: asset.uri,
            name: `upload_${Date.now()}_${index}.jpg`,
            type: "image/jpeg",
          } as any);
        });

        setUploading(true);
        const backendUrl =
          process.env.EXPO_LOCAL_SERVER || "http://192.168.1.100:3000";
        const requestUrl = `${backendUrl}/api/trips/${tripId}/upload-trip-images`;

        try {
          const response = await fetch(requestUrl, {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            alert(`Upload failed: ${errorText}`);
          } else {
            const updatedTrip = await response.json();
            // Assume the backend returns the updated images list.
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

  if (uploading) {
    return (
      <View className="w-40 h-40 bg-gray-300 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <TouchableOpacity
        onPress={pickImages}
        className="bg-gray-300 w-40 h-40 justify-center items-center"
      >
        <Text className="text-gray-700 text-center">
          Click to upload images
        </Text>
      </TouchableOpacity>
    );
  } else {
    return (
      <View className="flex-row items-center">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
        >
          {images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img.url }}
              className="w-20 h-20 mr-2 rounded"
            />
          ))}
        </ScrollView>
        <TouchableOpacity
          onPress={pickImages}
          className="bg-blue-500 p-2 rounded-full ml-2"
        >
          <Text className="text-white text-xl">+</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

export default TripImagesUploader;
