import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import MapSearch from "../../components/map-search-creaete-trip";

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
  // The location field is now integrated in MapSearch.
  const [tripLocation, setTripLocation] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Get user's current location.
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

  // Callback to update location info from MapSearch.
  const handleLocationSelect = (coords: [number, number], address: string) => {
    setTripLocation(address);
    console.log("Location selected:", coords, address);
  };

  // Toggle tag selection.
  const handleTagPress = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Split tags into two rows.
  const row1 = TRIP_TAGS.filter((_, i) => i % 2 === 0);
  const row2 = TRIP_TAGS.filter((_, i) => i % 2 !== 0);

  return (
    <ScrollView
      scrollEnabled={scrollEnabled}
      style={{ flex: 1, backgroundColor: "white", padding: 20 }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Trip Name Input */}
      <TextInput
        style={{
          width: "100%",
          height: 40,
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 5,
          marginBottom: 10,
          paddingHorizontal: 10,
        }}
        placeholder="Name"
        value={tripName}
        onChangeText={setTripName}
      />

      {/* MapSearch Component (integrated search field and map) */}
      <MapSearch
        onLocationSelect={handleLocationSelect}
        initialLocation={userLocation}
        onMapTouchStart={() => setScrollEnabled(false)}
        onMapTouchEnd={() => setScrollEnabled(true)}
      />

      {/* Image Upload Placeholder */}
      <View
        style={{
          width: "100%",
          height: 64,
          backgroundColor: "#e5e5e5",
          justifyContent: "center",
          alignItems: "center",
          marginVertical: 10,
        }}
      >
        <Text style={{ color: "#777" }}>[ Upload Images Placeholder ]</Text>
      </View>

      {/* Tags Section */}
      <Text style={{ fontSize: 16, fontWeight: "600", marginVertical: 10 }}>
        Select Tags:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "column", paddingHorizontal: 10 }}>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            {row1.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagPress(tag)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                    padding: 5,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 5,
                    backgroundColor: isSelected ? "#3b82f6" : "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: isSelected ? "#fff" : "#000",
                    }}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: "row" }}>
            {row2.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagPress(tag)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                    padding: 5,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 5,
                    backgroundColor: isSelected ? "#3b82f6" : "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: isSelected ? "#fff" : "#000",
                    }}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Create Trip / Cancel Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#10b981",
            paddingVertical: 10,
            marginRight: 5,
            borderRadius: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Create Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#ef4444",
            paddingVertical: 10,
            marginLeft: 5,
            borderRadius: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateTripPage;
