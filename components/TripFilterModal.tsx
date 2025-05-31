import { useEffect, useState } from "react";
import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Trip } from "../interfaces/trip-interface";

type TripFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  trips: Trip[];
  onApply: (
    filteredTrips: Trip[],
    chosenFilters: { id: string; label: string }[]
  ) => void;
  initialFilters?: {
    location: string;
    tags: string[];
  };
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
  initialFilters = { location: "", tags: [] },
}: TripFilterModalProps) {
  const [filters, setFilters] = useState({
    location: "",
    tags: [] as string[],
  });

  useEffect(() => {
    if (visible) {
      setFilters({
        location: initialFilters.location,
        tags: initialFilters.tags,
      });
    }
  }, [visible]);

  if (!visible) return null;

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    setFilters({ ...filters, tags: newTags });
  };

  const applyFilters = () => {
    let result = [...trips];

    if (filters.location.trim()) {
      result = result.filter((trip) =>
        trip.location.address
          ?.toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    if (filters.tags.length > 0) {
      result = result.filter((trip) => {
        const tripTags = (trip as any).tags || [];
        return filters.tags.every((tag) => tripTags.includes(tag));
      });
    }

    const chosenFilters: { id: string; label: string }[] = [];
    if (filters.location.trim()) {
      chosenFilters.push({
        id: `tripLocation=${filters.location}`,
        label: `Trip Location: ${filters.location}`,
      });
    }

    filters.tags.forEach((tag) => {
      chosenFilters.push({
        id: `tripTag=${tag}`,
        label: tag,
      });
    });

    onApply(result, chosenFilters);
    onClose();
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 justify-center items-center">
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View className="w-[92%] bg-white rounded-3xl p-6 max-h-[85%] shadow-xl">
            {/* Title */}
            <Text className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
              Filter Trips
            </Text>

            {/* Location Input */}
            <TextInput
              placeholder="Search by location..."
              placeholderTextColor="#999"
              value={filters.location}
              onChangeText={(val) =>
                setFilters((prev) => ({ ...prev, location: val }))
              }
              className="bg-gray-100 px-4 py-3 rounded-xl mb-4 text-[15px] text-gray-800"
            />

            {/* Tags */}
            <Text className="text-base font-semibold text-gray-700 mb-2">
              Tags
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5"
            >
              {TAGS.map((tag) => {
                const selected = filters.tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    className={`px-4 py-2 mr-2 rounded-full border transition-all ${
                      selected
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-gray-300 bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selected ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity
              className="bg-emerald-600 py-3 rounded-xl shadow-sm"
              onPress={applyFilters}
            >
              <Text className="text-white text-center text-base font-semibold">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}
