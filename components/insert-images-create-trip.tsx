import React, { useEffect } from "react";
import { View, ScrollView, Image, Text } from "react-native";
import { styled } from "nativewind";

const demoImages = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL8gIuex0ecqGngiVtDbpOm2icIqOfjz__iw&s",
  "https://www.theblondeabroad.com/wp-content/uploads/2019/03/iceland-1-1.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtABPXlSfZa7w1CbURQgC1j37NTahq5TO9sg&s",
];

const StyledImage = styled(Image);

type ImageUploadPhotosProps = {
  onImagesChange?: (images: string[]) => void;
};

const ImageUploadPhotos: React.FC<ImageUploadPhotosProps> = ({
  onImagesChange,
}) => {
  // Send the demo images list to the parent as soon as the component mounts.
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(demoImages);
    }
  }, [onImagesChange]);

  return (
    <View className="my-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {demoImages.map((url, index) => (
          <View key={index} className="mr-2">
            <StyledImage
              source={{ uri: url }}
              className="w-32 h-32 rounded-lg"
            />
          </View>
        ))}
      </ScrollView>
      <Text className="text-center text-gray-500 mt-2">
        Future feature: Upload images
      </Text>
    </View>
  );
};

export default ImageUploadPhotos;
