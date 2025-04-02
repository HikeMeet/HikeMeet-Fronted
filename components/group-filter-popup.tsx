// components/GroupFilterPopup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";

export default function GroupFilterPopup({ onClose }: { onClose: () => void }) {
  const [filters, setFilters] = useState({
    max_members: "",
    difficulty: "",
    status: "",
    scheduled_start: "",
    scheduled_end: "",
  });

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 justify-center items-center">
        <TouchableWithoutFeedback>
          <View className="w-[90%] bg-white rounded-xl p-5">
            <Text className="text-lg font-semibold mb-3">Group Filters</Text>

            <TextInput
              placeholder="Max Members"
              keyboardType="numeric"
              value={filters.max_members}
              onChangeText={(val) =>
                setFilters({ ...filters, max_members: val })
              }
              className="bg-gray-100 px-3 py-2 rounded mb-2"
            />

            <TextInput
              placeholder="Difficulty"
              value={filters.difficulty}
              onChangeText={(val) =>
                setFilters({ ...filters, difficulty: val })
              }
              className="bg-gray-100 px-3 py-2 rounded mb-2"
            />

            <TextInput
              placeholder="Status (planned/active)"
              value={filters.status}
              onChangeText={(val) => setFilters({ ...filters, status: val })}
              className="bg-gray-100 px-3 py-2 rounded mb-2"
            />

            <TextInput
              placeholder="Start Date (YYYY-MM-DD)"
              value={filters.scheduled_start}
              onChangeText={(val) =>
                setFilters({ ...filters, scheduled_start: val })
              }
              className="bg-gray-100 px-3 py-2 rounded mb-2"
            />

            <TextInput
              placeholder="End Date (YYYY-MM-DD)"
              value={filters.scheduled_end}
              onChangeText={(val) =>
                setFilters({ ...filters, scheduled_end: val })
              }
              className="bg-gray-100 px-3 py-2 rounded mb-4"
            />

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
