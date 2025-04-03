// FiltersBar.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type FilterItem = {
  id: string; // מפתח ייחודי לזיהוי הפילטר (למשל "trip" / "group" / "city" וכו')
  label: string; // מה מוצג בצ'יפ למשתמש
};

type FiltersBarProps = {
  onOpenGroupFilter: () => void;
  onOpenTripFilter: () => void;
  filters: FilterItem[]; // רשימת הפילטרים הנוכחיים
  onRemoveFilter: (id: string) => void; // פעולה למחיקת פילטר יחיד
};

export default function FiltersBar({
  onOpenGroupFilter,
  onOpenTripFilter,
  filters,
  onRemoveFilter,
}: FiltersBarProps) {
  return (
    <View>
      {/* כפתורי הפתיחה של חלונות הסינון */}
      <View className="flex-row mt-2 space-x-2">
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

      {/* תצוגת הפילטרים הפעילים כצ'יפים */}
      <View className="flex-row flex-wrap mt-2">
        {filters.map((filter) => (
          <View
            key={filter.id}
            className="flex-row items-center bg-green-200 px-2 py-1 rounded-full mr-2 mb-2"
          >
            <Text className="mr-2 text-sm">{filter.label}</Text>
            <TouchableOpacity
              onPress={() => onRemoveFilter(filter.id)}
              className="bg-green-600 rounded-full px-2"
            >
              <Text className="text-white text-sm">X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}
