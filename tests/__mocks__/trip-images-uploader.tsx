import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface TripImagesUploaderProps {
  tripId: string;
  enabled: boolean;
  initialImages: string[];
  onImagesUpdated: (images: string[]) => void;
}

const TripImagesUploader: React.FC<TripImagesUploaderProps> = ({
  tripId,
  enabled,
  initialImages,
  onImagesUpdated,
}) => {
  const handleAddImage = () => {
    // Mock adding an image
    const newImages = [...initialImages, "mock-image-url.jpg"];
    onImagesUpdated(newImages);
  };

  return (
    <View testID="trip-images-uploader">
      <Text testID="images-count">Images: {initialImages.length}</Text>
      {enabled && (
        <TouchableOpacity testID="add-image-button" onPress={handleAddImage}>
          <Text>Add Image</Text>
        </TouchableOpacity>
      )}
      {!enabled && <Text testID="not-enabled">Upload disabled</Text>}
    </View>
  );
};

export default TripImagesUploader;
