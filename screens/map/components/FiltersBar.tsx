import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export type ActiveFilter = {
  id: string;
  label: string;
};

type FiltersBarProps = {
  filters: ActiveFilter[];
  onRemoveFilter: (filterId: string) => void;
  onOpenTripFilter: () => void;
  onOpenGroupFilter: () => void;
};

export default function FiltersBar({
  filters,
  onRemoveFilter,
  onOpenTripFilter,
  onOpenGroupFilter,
}: FiltersBarProps) {
  return (
    <View className="mt-2">
      {/* כפתורים ראשיים: Trip / Group Filter */}
      <View className="flex-row space-x-2 mb-2">
        <TouchableOpacity
          onPress={onOpenGroupFilter}
          className="flex-row items-center bg-white rounded-full px-3 py-1 shadow-sm"
        >
          <Ionicons name="people" size={16} color="#444" />
          <Text className="text-sm text-gray-800 font-semibold ml-1">
            Filter Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenTripFilter}
          className="flex-row items-center bg-white rounded-full px-3 py-1 shadow-sm"
        >
          <Ionicons name="map" size={16} color="#444" />
          <Text className="text-sm text-gray-800 font-semibold ml-1">
            Filter Trips
          </Text>
        </TouchableOpacity>
      </View>

      {/* רשימת פילטרים פעילים כ'צ'יפים' גלילה אופקית */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-center space-x-2">
          {filters.map((f) => (
            <View
              key={f.id}
              className="flex-row items-center bg-white border border-green-500 px-3 py-1 rounded-full shadow-sm"
            >
              <Text className="mr-1 text-sm text-green-700 font-medium">
                {f.label}
              </Text>
              <TouchableOpacity
                onPress={() => onRemoveFilter(f.id)}
                className="flex-row items-center justify-center w-5 h-5 rounded-full bg-green-600"
              >
                <Text className="text-white text-xs">×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
