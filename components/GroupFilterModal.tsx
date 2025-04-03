// ./components/GroupFilterModal.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Group } from "../screens/map/map-page"; // או הנתיב הנכון ל-Group interface

type Props = {
  visible: boolean;
  onClose: () => void;
  groups: Group[];
  onApply: (filteredGroups: Group[]) => void;
};

export default function GroupFilterModal({
  visible,
  onClose,
  groups,
  onApply,
}: Props) {
  const [filters, setFilters] = useState({
    max_members: "",
    difficulty: "",
    status: "",
    scheduled_start: "",
    scheduled_end: "",
  });

  if (!visible) return null;

  const applyFilters = () => {
    let result = [...groups];

    if (filters.max_members) {
      result = result.filter(
        (g) => g.max_members <= parseInt(filters.max_members, 10)
      );
    }

    if (filters.difficulty) {
      result = result.filter((g: any) =>
        g.difficulty?.toLowerCase().includes(filters.difficulty.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter((g) =>
        g.status?.toLowerCase().includes(filters.status.toLowerCase())
      );
    }

    if (filters.scheduled_start) {
      result = result.filter(
        (g: any) =>
          g.scheduled_start && g.scheduled_start >= filters.scheduled_start
      );
    }

    if (filters.scheduled_end) {
      result = result.filter(
        (g: any) => g.scheduled_end && g.scheduled_end <= filters.scheduled_end
      );
    }

    onApply(result);
    onClose();
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 justify-center items-center">
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View className="w-[90%] bg-white rounded-xl p-5">
            <Text className="text-lg font-semibold mb-3">Group Filters</Text>

            <ScrollView>
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
            </ScrollView>

            <TouchableOpacity
              className="bg-green-600 py-2 rounded mt-2"
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
