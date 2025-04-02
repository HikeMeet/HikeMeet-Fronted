// screens/map/components/CenterOnMeButton.tsx
import React from "react";
import { TouchableOpacity, Image } from "react-native";

type CenterOnMeButtonProps = {
  onPress: () => void;
};

export default function CenterOnMeButton({ onPress }: CenterOnMeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="absolute top-40 left-4 z-50 w-10 h-10 rounded-full border border-green-600 items-center justify-center bg-white/80"
    >
      <Image
        source={require("../../../assets/center-circle-map.png")}
        className="w-5 h-5 tint-green-600"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
