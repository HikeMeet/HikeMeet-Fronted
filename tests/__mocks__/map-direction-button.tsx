import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface MapDirectionButtonProps {
  latitude: number;
  longitude: number;
}

const MapDirectionButton: React.FC<MapDirectionButtonProps> = ({
  latitude,
  longitude,
}) => {
  const handlePress = () => {
    console.log(`Navigate to: ${latitude}, ${longitude}`);
  };

  return (
    <TouchableOpacity
      testID="map-direction-button"
      onPress={handlePress}
      style={{ position: "absolute", bottom: 10, right: 10 }}
    >
      <Text testID="direction-text">Get Directions</Text>
    </TouchableOpacity>
  );
};

export default MapDirectionButton;
