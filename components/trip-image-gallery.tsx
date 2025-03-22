// components/TripImagesUploader.tsx
import React, { useState, useRef, useEffect } from "react";
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
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const TripImagesUploader: React.FC<TripImagesUploaderProps> = ({
  tripId,
  initialImages = [],
  onImagesUpdated,
}) => {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (fullScreenVisible && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: selectedIndex * SCREEN_WIDTH,
        animated: false,
      });
    }
  }, [fullScreenVisible, selectedIndex]);

  const pickImages = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Media library permissions are required to upload images.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (images.length + result.assets.length > MAX_IMAGE_COUNT) {
          alert(`Cannot upload more than ${MAX_IMAGE_COUNT} photos to a trip.`);
          return;
        }
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
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (!response.ok) {
            const errorText = await response.text();
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
    setSelectedIndex(index);
    setFullScreenVisible(true);
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

  const handleDeleteSelectedImages = async () => {
    try {
      const backendUrl =
        process.env.EXPO_LOCAL_SERVER || "http://192.168.1.100:3000";
      const requestUrl = `${backendUrl}/api/trips/${tripId}/delete-trip-images`;
      const response = await fetch(requestUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: selectedForDeletion }),
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
        <TouchableOpacity
          onPress={pickImages}
          className="bg-gray-300 w-40 h-40 justify-center items-center"
        >
          <Text className="text-gray-700 text-center">
            Click to upload images
          </Text>
        </TouchableOpacity>
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
                  source={{ uri: img.url }}
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
        </View>
      )}

      {/* Fullscreen Modal with horizontal scroll */}
      <Modal
        visible={fullScreenVisible}
        animationType="slide"
        onRequestClose={() => setFullScreenVisible(false)}
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity
            className="absolute top-10 right-5 bg-white/70 p-2 rounded-full z-10"
            onPress={() => setFullScreenVisible(false)}
          >
            <Text className="text-black text-lg">Close</Text>
          </TouchableOpacity>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollTo({
                x: selectedIndex * SCREEN_WIDTH,
                animated: false,
              });
            }}
            className="flex-1"
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.url }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default TripImagesUploader;
