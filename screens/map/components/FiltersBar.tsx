// ./components/FiltersBar.tsx

import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export type ActiveFilter = {
  id: string; // מה שמזהה את הפילטר (למשל "tripTag=Water", "city=TelAviv")
  label: string; // מה יוצג למשתמש ("Trip Tag: Water", "City: Tel Aviv")
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
    <View>
      {/* כפתורי פתיחת חלונות סינון */}
      <View className="flex-row mt-2 space-x-2 mb-2">
        <TouchableOpacity
          onPress={onOpenGroupFilter}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          <Text className="text-sm text-gray-800 font-semibold">
            Filter Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenTripFilter}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          <Text className="text-sm text-gray-800 font-semibold">
            Filter Trips
          </Text>
        </TouchableOpacity>
      </View>

      {/* גלילה אופקית כדי שהצ'יפים יהיו בשורה אחת */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-center">
          {filters.map((f) => (
            <View
              key={f.id}
              className="flex-row items-center bg-green-200 px-2 py-1 rounded-full mr-2"
            >
              <Text className="mr-2 text-sm">{f.label}</Text>
              <TouchableOpacity
                onPress={() => onRemoveFilter(f.id)}
                className="bg-green-600 rounded-full px-2"
              >
                <Text className="text-white text-sm">X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
