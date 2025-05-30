import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface MapSearchProps {
  onLocationSelect: (coords: [number, number], address: string) => void;
  initialLocation?: [number, number] | null;
  onMapTouchStart?: () => void;
  onMapTouchEnd?: () => void;
}

const MapSearch: React.FC<MapSearchProps> = ({
  onLocationSelect,
  onMapTouchStart,
  onMapTouchEnd,
}) => {
  const handleSelectLocation = () => {
    // Mock selecting a test location
    onLocationSelect([34.7749, -122.4194], "San Francisco, CA");
  };

  return (
    <View testID="map-search-component">
      <Text>Map Search Component</Text>
      <TouchableOpacity
        testID="select-location-button"
        onPress={handleSelectLocation}
        onPressIn={onMapTouchStart}
        onPressOut={onMapTouchEnd}
      >
        <Text>Select Test Location</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MapSearch;
