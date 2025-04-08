import React from "react";
import { TouchableOpacity, Image } from "react-native";

type Props = {
  onPress: () => void;
  /** כשה‑disabled true – הכפתור מטושטש ולא מקבל לחיצה */
  disabled?: boolean;
};

export default function CenterOnMeButton({ onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={`absolute top-10 left-4 z-50 w-10 h-10 rounded-full border 
    border-green-600 items-center justify-center bg-white/80
    ${disabled ? "opacity-40" : ""}`}
    >
      <Image
        source={require("../../../../assets/center-circle-map.png")}
        className="w-5 h-5 tint-green-600"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
