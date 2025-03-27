// screens/map/components/CenterOnMeButton.tsx
import React from "react";
import { Text, TouchableOpacity } from "react-native";

type CenterOnMeButtonProps = {
  onPress: () => void;
};

export default function CenterOnMeButton({ onPress }: CenterOnMeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute z-50 top-14 right-4 bg-teal-600 py-2 px-3 rounded-lg shadow-md"
    >
      <Text className="text-white font-semibold">Center on Me</Text>
    </TouchableOpacity>
  );
}
