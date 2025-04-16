import React = require("react");
import { Alert, Linking, TouchableOpacity, Text } from "react-native";

interface MapDirectionButtonProps {
  destination?: string;
  latitude?: number;
  longitude?: number;
}

const MapDirectionButton: React.FC<MapDirectionButtonProps> = ({
  destination,
  latitude,
  longitude,
}) => {
  const handlePress = () => {
    let url = "";
    if (destination) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        destination
      )}`;
    } else if (latitude !== undefined && longitude !== undefined) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    } else {
      Alert.alert("Error", "No valid destination provided.");
      return;
    }

    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the map.")
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="mt-2 bg-blue-500 px-1 py-1 rounded self-start"
    >
      <Text className="text-white text-sm font-semibold">Get Directions</Text>
    </TouchableOpacity>
  );
};

export default MapDirectionButton;
