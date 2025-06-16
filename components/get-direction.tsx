import React from "react";
import { Alert, Linking, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

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
      activeOpacity={0.8}
      onPress={handlePress}
      className="
        flex-row items-center
        bg-blue-600 px-3 py-2
        rounded-lg shadow
      "
    >
      <Icon name="directions" size={20} color="#fff" />
      <Text className="text-white font-semibold ml-2">Get Directions</Text>
    </TouchableOpacity>
  );
};

export default MapDirectionButton;
