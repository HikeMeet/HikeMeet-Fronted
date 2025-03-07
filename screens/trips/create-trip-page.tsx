import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";

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

  // Toggle the selection state of a tag
  const handleTagPress = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <ScrollView
      className="p-5 bg-white"
      contentContainerStyle={{ alignItems: "center", paddingBottom: 120 }}
    >
      {/* Header */}
      <Text className="text-xl font-bold my-2">Create Trip Page</Text>

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

      {/* Map Placeholder */}
      <View className="w-full h-40 bg-gray-200 justify-center items-center my-2">
        <Text className="text-gray-500">[ Map Placeholder ]</Text>
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
