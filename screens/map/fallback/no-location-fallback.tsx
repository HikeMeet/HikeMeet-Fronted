import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CitySearchBar from "../components/header/city-search-bar";
import { Coordinate } from "../../../interfaces/map-interface";
import { TEL_AVIV_COORDS } from "../../../utils/geo";
import { theme } from "../../../utils/theme";

interface NoLocationFallbackProps {
  onLocationSelect: (coords: Coordinate, placeName: string) => void;
  errorMessage?: string;
}

export default function NoLocationFallback({
  onLocationSelect,
  errorMessage,
}: NoLocationFallbackProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectTelAviv = useCallback(() => {
    onLocationSelect(TEL_AVIV_COORDS, "Tel Aviv, Israel");
  }, [onLocationSelect]);

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-1 items-center justify-center space-y-6">
        {/* Icon */}
        <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center">
          <Ionicons
            name="location-outline"
            size={48}
            color={theme.colors.text.secondary}
          />
        </View>

        {/* Title */}
        <Text className="text-2xl font-semibold text-gray-900 text-center">
          We need your location
        </Text>

        {/* Description */}
        <Text className="text-base text-gray-600 text-center px-8">
          {errorMessage ||
            "To show hiking trails near you, please enable location access or search for a city"}
        </Text>

        {/* Search Bar */}
        <View className="w-full max-w-sm">
          <Text className="text-sm text-gray-600 mb-2">
            Search for a city or area:
          </Text>
          <CitySearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSelectLocation={onLocationSelect}
            onClearLocation={() => setSearchQuery("")}
            placeholder="Enter city name..."
          />
        </View>

        {/* Divider */}
        <View className="flex-row items-center w-full max-w-sm my-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="px-3 text-gray-500">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Default Location Button */}
        <TouchableOpacity
          onPress={handleSelectTelAviv}
          className="bg-teal-600 px-6 py-3 rounded-full flex-row items-center space-x-2"
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={20} color="white" />
          <Text className="text-white font-medium">
            Use Tel Aviv as default
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
