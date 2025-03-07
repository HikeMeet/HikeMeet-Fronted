import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { styled } from "nativewind";

const StyledMapView = styled(Mapbox.MapView);
const StyledCamera = styled(Mapbox.Camera);

const TRIP_TAGS = [
  "Water",
  "Ropes",
  "Ladders",
  "Lab",
  "Camping",
  "Hiking",
  "Snow",
  "Mountains",
  "Desert",
  "Beach",
  "Kayaking",
  "Rafting",
  "Road Trip",
  "City Tour",
  "Museum",
];

const CreateTripPage: React.FC = () => {
  const [tripName, setTripName] = useState<string>("");
  const [tripLocation, setTripLocation] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const cameraRef = useRef<Mapbox.Camera>(null);

  // Request location permissions and get current location.
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setUserLocation([longitude, latitude]);
    })();
  }, []);

  // Toggle tag selection.
  const handleTagPress = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Function to recenter the map to the user's location.
  const handleRecenter = () => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.flyTo(userLocation, 1000); // 1000ms animation duration
    }
  };

  // Split tags into two rows.
  const row1 = TRIP_TAGS.filter((_, i) => i % 2 === 0);
  const row2 = TRIP_TAGS.filter((_, i) => i % 2 !== 0);

  return (
    <ScrollView
      scrollEnabled={scrollEnabled}
      className="flex-1 bg-white p-5"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Name and Location Inputs */}
      <TextInput
        className="w-full h-10 border border-gray-300 rounded mb-2 px-2"
        placeholder="Name"
        value={tripName}
        onChangeText={setTripName}
      />
      <TextInput
        className="w-full h-10 border border-gray-300 rounded mb-2 px-2"
        placeholder="Location"
        value={tripLocation}
        onChangeText={setTripLocation}
      />

      {/* Map View with recenter button */}
      <View
        className="h-72 w-72 self-center mb-2 relative"
        onTouchStart={() => setScrollEnabled(false)}
        onTouchEnd={() => setScrollEnabled(true)}
        onTouchCancel={() => setScrollEnabled(true)}
      >
        <StyledMapView className="flex-1">
          {userLocation && (
            <StyledCamera
              ref={cameraRef}
              centerCoordinate={userLocation}
              zoomLevel={14}
            />
          )}
        </StyledMapView>
        <TouchableOpacity
          onPress={handleRecenter}
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow"
        >
          <Text className="text-black text-xs">My Location</Text>
        </TouchableOpacity>
      </View>

      {/* Image Upload Placeholder */}
      <View className="w-full h-16 bg-gray-200 justify-center items-center my-2">
        <Text className="text-gray-500">[ Upload Images Placeholder ]</Text>
      </View>

      {/* Tags Section: horizontally scrollable with two rows */}
      <Text className="text-base font-semibold my-2">Select Tags:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-col px-2">
          <View className="flex-row mb-2">
            {row1.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagPress(tag)}
                  className={`flex-row items-center mr-2 p-1 border border-gray-400 rounded ${
                    isSelected ? "bg-blue-500" : "bg-white"
                  }`}
                >
                  <Text className="text-sm">{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View className="flex-row">
            {row2.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagPress(tag)}
                  className={`flex-row items-center mr-2 p-1 border border-gray-400 rounded ${
                    isSelected ? "bg-blue-500" : "bg-white"
                  }`}
                >
                  <Text className="text-sm">{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="flex-row justify-between mt-5">
        <TouchableOpacity className="flex-1 bg-green-500 py-3 mr-2 rounded items-center">
          <Text className="text-white font-semibold">Create Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-red-500 py-3 ml-2 rounded items-center">
          <Text className="text-white font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateTripPage;
