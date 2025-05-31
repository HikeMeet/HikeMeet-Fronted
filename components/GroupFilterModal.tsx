import { useEffect, useState } from "react";
import React from "react";
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
const STATUSES = ["planned", "active", "completed"];

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
  }, [visible]);

  if (!visible) return null;

  const toggleDifficulty = (diff: string) => {
    const newDiffs = filters.difficulties.includes(diff)
      ? filters.difficulties.filter((d) => d !== diff)
      : [...filters.difficulties, diff];
    setFilters({ ...filters, difficulties: newDiffs });
  };

  const toggleStatus = (st: string) => {
    const newStatuses = filters.statuses.includes(st)
      ? filters.statuses.filter((s) => s !== st)
      : [...filters.statuses, st];
    setFilters({ ...filters, statuses: newStatuses });
  };

  const applyFilters = () => {
    let result = [...groups];

    if (filters.maxMembers.trim()) {
      const maxVal = parseInt(filters.maxMembers.trim(), 10);
      if (!isNaN(maxVal)) {
        result = result.filter((g) => g.max_members <= maxVal);
      }
    }

    if (filters.difficulties.length > 0) {
      result = result.filter((g: any) =>
        filters.difficulties.includes(g.difficulty)
      );
    }

    if (filters.statuses.length > 0) {
      result = result.filter((g) =>
        filters.statuses.includes(g.status?.toLowerCase())
      );
    }

    if (filters.scheduledStart.trim()) {
      result = result.filter(
        (g: any) =>
          g.scheduled_start &&
          g.scheduled_start >= filters.scheduledStart.trim()
      );
    }

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
        label: df,
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
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 justify-center items-center">
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View className="w-[92%] mt-20 bg-white rounded-3xl p-6 max-h-[85%] shadow-xl">
            <Text className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
              Filter Groups
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Max Members */}
              <Text className="font-semibold mb-1 text-gray-700">
                Max Members
              </Text>
              <TextInput
                placeholder="Max Members"
                keyboardType="numeric"
                value={filters.maxMembers}
                onChangeText={(val) =>
                  setFilters({ ...filters, maxMembers: val })
                }
                className="bg-gray-100 px-4 py-3 rounded-xl mb-4 text-gray-800"
              />

              {/* Difficulties */}
              <Text className="font-semibold mb-2 text-gray-700">
                Difficulty
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                {DIFFICULTIES.map((diff) => {
                  const selected = filters.difficulties.includes(diff);
                  return (
                    <TouchableOpacity
                      key={diff}
                      onPress={() => toggleDifficulty(diff)}
                      className={`px-4 py-2 mr-2 rounded-full border ${
                        selected
                          ? "bg-emerald-600 border-emerald-600"
                          : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selected ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {diff}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Statuses */}
              <Text className="font-semibold mb-2 text-gray-700">Status</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                {STATUSES.map((st) => {
                  const selected = filters.statuses.includes(st);
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => toggleStatus(st)}
                      className={`px-4 py-2 mr-2 rounded-full border ${
                        selected
                          ? "bg-emerald-600 border-emerald-600"
                          : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selected ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Start Date */}
              <Text className="font-semibold mb-1 text-gray-700">
                Start Date (YYYY-MM-DD)
              </Text>
              <TextInput
                placeholder="Start Date"
                value={filters.scheduledStart}
                onChangeText={(val) =>
                  setFilters({ ...filters, scheduledStart: val })
                }
                className="bg-gray-100 px-4 py-3 rounded-xl mb-4 text-gray-800"
              />

              {/* End Date */}
              <Text className="font-semibold mb-1 text-gray-700">
                End Date (YYYY-MM-DD)
              </Text>
              <TextInput
                placeholder="End Date"
                value={filters.scheduledEnd}
                onChangeText={(val) =>
                  setFilters({ ...filters, scheduledEnd: val })
                }
                className="bg-gray-100 px-4 py-3 rounded-xl mb-6 text-gray-800"
              />
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
