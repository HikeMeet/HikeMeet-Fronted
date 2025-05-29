import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ActiveFilter } from "../../../../interfaces/map-interface";

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
    <View className="flex-col space-y-2">
      {/* Filter buttons*/}
      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={onOpenGroupFilter}
          className="flex-row items-center space-x-1 bg-white border border-gray-300 px-3 py-1 rounded-full shadow-sm"
        >
          <Ionicons name="people" size={16} color="#444" />
          <Text className="text-sm text-gray-800 font-semibold">
            Filter Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenTripFilter}
          className="flex-row items-center space-x-1 bg-white border border-gray-300 px-3 py-1 rounded-full shadow-sm"
        >
          <Ionicons name="map" size={16} color="#444" />
          <Text className="text-sm text-gray-800 font-semibold">
            Filter Trips
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rolling chips*/}
      {filters.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 2 }}
          className="pt-1"
        >
          <View className="flex-row space-x-1 items-center">
            {filters.map((filter) => (
              <View
                key={filter.id}
                className="flex-row items-center bg-green-50 border border-green-500 rounded-full px-3 py-1"
              >
                <Text className="text-green-700 text-sm mr-2">
                  {filter.label}
                </Text>
                <TouchableOpacity
                  onPress={() => onRemoveFilter(filter.id)}
                  className="bg-green-600 rounded-full w-5 h-5 items-center justify-center"
                >
                  <Text className="text-white text-xs">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
