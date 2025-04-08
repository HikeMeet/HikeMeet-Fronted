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
      className="bg-green-600 px-3 py-2 rounded"
    >
      <Text className="text-white font-semibold">
        {viewMode === "map" ? "List View" : "Map View"}
      </Text>
    </TouchableOpacity>
  );
}
