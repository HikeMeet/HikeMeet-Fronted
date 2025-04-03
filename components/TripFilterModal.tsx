// TripFilterModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Trip } from "../interfaces/trip-interface";

type Props = {
  visible: boolean;
  onClose: () => void;
  trips: Trip[];
  onApply: (
    filteredTrips: Trip[],
    chosenFilters: { id: string; label: string }[]
  ) => void;
};

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

export default function TripFilterModal({
  visible,
  onClose,
  trips,
  onApply,
}: Props) {
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

  const applyFilters = () => {
    // ממיינים את הטיולים המקומיים
    let result = [...trips];

    if (filters.location.trim()) {
      result = result.filter((trip) =>
        trip.location?.address
          ?.toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    if (filters.tags.length > 0) {
      // צריך להחזיק בכל trip איזה tags יש לו - אולי זה אצלך במודל
      result = result.filter((trip) => {
        const tripTags = (trip as any).tags || [];
        return filters.tags.every((tag) => tripTags.includes(tag));
      });
    }

    // יוצרים מערך של הפילטרים הנוכחיים (לצורך תצוגת הצ'יפים למשל):
    const chosenFilters = [];
    if (filters.location.trim()) {
      chosenFilters.push({
        id: `location=${filters.location}`,
        label: `Location: ${filters.location}`,
      });
    }
    filters.tags.forEach((tag) => {
      chosenFilters.push({ id: `tag=${tag}`, label: `Tag: ${tag}` });
    });

    onApply(result, chosenFilters);
    onClose();
  };

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 justify-center items-center">
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
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
                    className={`px-3 py-1 mr-2 rounded-full border ${
                      selected
                        ? "bg-green-600 border-green-600"
                        : "border-gray-400"
                    }`}
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
              onPress={applyFilters}
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
