import React from "react";
import { TouchableOpacity, Image } from "react-native";

type Props = {
  onPress: () => void;
  visible?: boolean;
};

export default function CenterOnMeButton({ onPress, visible = true }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="absolute top-10 left-4 z-50 w-10 h-10 rounded-full border 
    border-green-600 items-center justify-center bg-white/80"
    >
      <Image
        source={require("../../../../assets/center-circle-map.png")}
        className="w-5 h-5 tint-green-600"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
