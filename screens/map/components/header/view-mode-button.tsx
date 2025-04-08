import React from "react";
import { TouchableOpacity, Text } from "react-native";

type Props = {
  viewMode: "map" | "list";
  onToggle: () => void;
};

export default function ViewModeButton({ viewMode, onToggle }: Props) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="bg-green-600 px-3 py-1 rounded-full"
    >
      <Text className="text-white text-sm font-medium">
        {viewMode === "map" ? "List View" : "Map View"}
      </Text>
    </TouchableOpacity>
  );
}
