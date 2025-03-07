import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";

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
  // userLocation holds [longitude, latitude]
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  // Toggle the selection state of a tag
  const handleTagPress = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Request location permission and get current position
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

  return (
    <ScrollView
      className="p-5 bg-white"
      contentContainerStyle={{ alignItems: "center", paddingBottom: 120 }}
    >
      {/* Name Input */}
      <TextInput
        className="w-full h-10 border border-gray-300 rounded mb-2 px-2"
        placeholder="Name"
        value={tripName}
        onChangeText={setTripName}
      />

      {/* Location Input */}
      <TextInput
        className="w-full h-10 border border-gray-300 rounded mb-2 px-2"
        placeholder="Location"
        value={tripLocation}
        onChangeText={setTripLocation}
      />

      {/* Map with user location */}
      <View style={styles.page}>
        <View style={styles.container}>
          <Mapbox.MapView style={styles.map}>
            {userLocation && (
              <Mapbox.Camera centerCoordinate={userLocation} zoomLevel={14} />
            )}
          </Mapbox.MapView>
        </View>
      </View>

      {/* Image Upload Placeholder */}
      <View className="w-full h-24 bg-gray-200 justify-center items-center my-2">
        <Text className="text-gray-500">[ Upload Images Placeholder ]</Text>
      </View>

      {/* Scrollable Tags Section */}
      <Text className="text-base font-semibold my-2 self-start">
        Select Tags:
      </Text>
      <ScrollView
        className="w-full mb-4"
        contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
      >
        {TRIP_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => handleTagPress(tag)}
              className="flex-row items-center m-1"
            >
              <View
                className={`w-5 h-5 border border-gray-400 mr-2 ${
                  isSelected ? "bg-blue-500" : "bg-white"
                }`}
              />
              <Text className="text-sm">{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Buttons */}
      <View className="flex-row mt-5 justify-between w-full">
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

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    height: 300,
    width: 300,
  },
  map: {
    flex: 1,
  },
});
