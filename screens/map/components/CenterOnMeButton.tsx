// screens/map/components/CenterOnMeButton.tsx
import React from "react";
import { Text, TouchableOpacity, Image } from "react-native";

type CenterOnMeButtonProps = {
  onPress: () => void;
};

/**
 * כפתור "Center on Me" המציג אייקון PNG מקומי.
 * מניח שקובץ `centerIcon.png` קיים בנתיב הנכון.
 */
export default function CenterOnMeButton({ onPress }: CenterOnMeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="absolute z-50 top-14 right-4 flex-row items-center bg-teal-600 py-2 px-3 rounded-full shadow-md"
    >
      {/* אייקון מקומי (PNG) */}
      <Image
        source={require("../../../assets/center-circle-map.png")}
        className="w-6 h-6 mr-2"
        resizeMode="contain"
      />
      {/* טקסט */}
      <Text className="text-white font-semibold"></Text>
    </TouchableOpacity>
  );
}
