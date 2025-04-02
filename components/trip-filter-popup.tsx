// components/TripFilterPopup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

const TAGS = [
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

export default function TripFilterPopup({ onClose }: { onClose: () => void }) {
  const [filters, setFilters] = useState({
    location: "",
    tags: [] as string[],
  });

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    setFilters({ ...filters, tags: newTags });
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 justify-center items-center">
        <TouchableWithoutFeedback>
          <View className="w-[90%] bg-white rounded-xl p-5 max-h-[80%]">
            <Text className="text-lg font-semibold mb-3">Trip Filters</Text>

            <TextInput
              placeholder="Location"
              value={filters.location}
              onChangeText={(val) => setFilters({ ...filters, location: val })}
              className="bg-gray-100 px-3 py-2 rounded mb-3"
            />

            <Text className="font-semibold mb-2">Tags</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {TAGS.map((tag) => {
                const selected = filters.tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    className={`px-3 py-1 mr-2 rounded-full border ${selected ? "bg-green-600 border-green-600" : "border-gray-400"}`}
                  >
                    <Text
                      className={`text-sm ${selected ? "text-white" : "text-gray-600"}`}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              className="bg-green-600 py-2 rounded"
              onPress={onClose}
            >
              <Text className="text-white text-center font-semibold">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}
