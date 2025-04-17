import React, { useRef, useEffect } from "react";
import { TouchableOpacity, Text, Animated } from "react-native";

type Props = {
  viewMode: "map" | "list";
  onToggle: () => void;
};

export default function ViewModeButton({ viewMode, onToggle }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      onToggle();
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: "#10B981",
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 9999,
        }}
      >
        <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
          {viewMode === "map" ? "List View" : "Map View"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
