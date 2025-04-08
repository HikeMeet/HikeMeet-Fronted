import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Group } from "../interfaces/group-interface";

type GroupFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  groups: Group[];
  /** Occurs when you click Apply */
  onApply: (
    filteredGroups: Group[],
    chosenFilters: { id: string; label: string }[]
  ) => void;
  initialFilters?: {
    difficulties: string[];
    statuses: string[];
    maxMembers?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
  };
};

const DIFFICULTIES = ["beginner", "intermediate", "advanced", "hardcore"];
const STATUSES = ["planned", "active"];

export default function GroupFilterModal({
  visible,
  onClose,
  groups,
  onApply,
  initialFilters = {
    difficulties: [],
    statuses: [],
    maxMembers: "",
    scheduledStart: "",
    scheduledEnd: "",
  },
}: GroupFilterModalProps) {
  const [filters, setFilters] = useState({
    difficulties: [] as string[],
    statuses: [] as string[],
    maxMembers: "",
    scheduledStart: "",
    scheduledEnd: "",
  });

  useEffect(() => {
    if (visible) {
      setFilters({
        difficulties: initialFilters.difficulties || [],
        statuses: initialFilters.statuses || [],
        maxMembers: initialFilters.maxMembers || "",
        scheduledStart: initialFilters.scheduledStart || "",
        scheduledEnd: initialFilters.scheduledEnd || "",
      });
    }
  }, [visible, initialFilters]);

  if (!visible) return null;

  // Selecting/deselecting a specific difficulty
  const toggleDifficulty = (diff: string) => {
    const newDiffs = filters.difficulties.includes(diff)
      ? filters.difficulties.filter((d) => d !== diff)
      : [...filters.difficulties, diff];

    setFilters({ ...filters, difficulties: newDiffs });
  };

  // Select/deselect a specific status
  const toggleStatus = (st: string) => {
    const newStatuses = filters.statuses.includes(st)
      ? filters.statuses.filter((s) => s !== st)
      : [...filters.statuses, st];
    setFilters({ ...filters, statuses: newStatuses });
  };

  const applyFilters = () => {
    let result = [...groups];

    // maxMembers
    if (filters.maxMembers.trim()) {
      const maxVal = parseInt(filters.maxMembers.trim(), 10);
      if (!isNaN(maxVal)) {
        result = result.filter((g) => g.max_members <= maxVal);
      }
    }

    // difficulties
    if (filters.difficulties.length > 0) {
      result = result.filter((g: any) =>
        filters.difficulties.includes(g.difficulty)
      );
    }

    // statuses
    if (filters.statuses.length > 0) {
      result = result.filter((g) =>
        filters.statuses.includes(g.status?.toLowerCase())
      );
    }

    // Start date
    if (filters.scheduledStart.trim()) {
      result = result.filter(
        (g: any) =>
          g.scheduled_start &&
          g.scheduled_start >= filters.scheduledStart.trim()
      );
    }

    // End date
    if (filters.scheduledEnd.trim()) {
      result = result.filter(
        (g: any) =>
          g.scheduled_end && g.scheduled_end <= filters.scheduledEnd.trim()
      );
    }

    const chosenFilters: { id: string; label: string }[] = [];

    if (filters.maxMembers.trim()) {
      chosenFilters.push({
        id: `groupMaxMembers=${filters.maxMembers}`,
        label: `MaxMembers <= ${filters.maxMembers}`,
      });
    }

    filters.difficulties.forEach((df) => {
      chosenFilters.push({
        id: `groupDifficulty=${df}`,
        label: `Group Difficulty: ${df}`,
      });
    });

    filters.statuses.forEach((st) => {
      chosenFilters.push({
        id: `groupStatus=${st}`,
        label: `Group Status: ${st}`,
      });
    });

    if (filters.scheduledStart.trim()) {
      chosenFilters.push({
        id: `groupStart=${filters.scheduledStart}`,
        label: `Start >= ${filters.scheduledStart}`,
      });
    }

    if (filters.scheduledEnd.trim()) {
      chosenFilters.push({
        id: `groupEnd=${filters.scheduledEnd}`,
        label: `End <= ${filters.scheduledEnd}`,
      });
    }

    onApply(result, chosenFilters);
    onClose();
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 justify-center items-center">
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View className="w-[90%] mt-20 bg-white rounded-xl p-5 max-h-[80%]">
            <Text className="text-lg font-semibold mb-3">Group Filters</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* maxMembers */}
              <Text className="font-semibold mb-1">Max Members</Text>
              <TextInput
                placeholder="Max Members"
                keyboardType="numeric"
                value={filters.maxMembers}
                onChangeText={(val) =>
                  setFilters({ ...filters, maxMembers: val })
                }
                className="bg-gray-100 px-3 py-2 rounded mb-2"
              />

              {/* difficulties */}
              <Text className="font-semibold mb-1">Difficulty</Text>
              <ScrollView
                horizontal
                className="mb-2"
                showsHorizontalScrollIndicator={false}
              >
                {DIFFICULTIES.map((diff) => {
                  const selected = filters.difficulties.includes(diff);
                  return (
                    <TouchableOpacity
                      key={diff}
                      onPress={() => toggleDifficulty(diff)}
                      className={`px-3 py-1 mr-2 rounded-full border ${
                        selected
                          ? "bg-green-600 border-green-600"
                          : "border-gray-400"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selected ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {diff}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* statuses */}
              <Text className="font-semibold mb-1">Status</Text>
              <ScrollView
                horizontal
                className="mb-2"
                showsHorizontalScrollIndicator={false}
              >
                {STATUSES.map((st) => {
                  const selected = filters.statuses.includes(st);
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => toggleStatus(st)}
                      className={`px-3 py-1 mr-2 rounded-full border ${
                        selected
                          ? "bg-green-600 border-green-600"
                          : "border-gray-400"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selected ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text className="font-semibold mb-1">
                Start Date (YYYY-MM-DD)
              </Text>
              <TextInput
                placeholder="Start Date (YYYY-MM-DD)"
                value={filters.scheduledStart}
                onChangeText={(val) =>
                  setFilters({ ...filters, scheduledStart: val })
                }
                className="bg-gray-100 px-3 py-2 rounded mb-2"
              />

              <Text className="font-semibold mb-1">End Date (YYYY-MM-DD)</Text>
              <TextInput
                placeholder="End Date (YYYY-MM-DD)"
                value={filters.scheduledEnd}
                onChangeText={(val) =>
                  setFilters({ ...filters, scheduledEnd: val })
                }
                className="bg-gray-100 px-3 py-2 rounded mb-4"
              />
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
