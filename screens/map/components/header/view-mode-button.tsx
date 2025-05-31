import React, { useRef } from "react";
import { Animated, Pressable, Text } from "react-native";
import { List, Map as MapIcon } from "lucide-react-native";
import { palette } from "../../../../utils/theme";

type Props = {
  viewMode: "map" | "list";
  onToggle: () => void;
};

export default function ViewModeButton({ viewMode, onToggle }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number, cb?: () => void) =>
    Animated.timing(scale, {
      toValue: to,
      duration: 90,
      useNativeDriver: true,
    }).start(cb);

  const backgroundColor = viewMode === "map" ? palette.primary : palette.third;

  return (
    <Animated.View
      style={{ transform: [{ scale }] }}
      className="shadow-lg rounded-full"
    >
      <Pressable
        onPressIn={() => animate(0.94)}
        onPressOut={() => animate(1, onToggle)}
        android_ripple={{ color: "#ffffff30", borderless: true }}
        className="flex-row items-center justify-center gap-1 px-3 h-10 rounded-full"
        style={{ backgroundColor }}
      >
        {viewMode === "map" ? (
          <>
            <List size={16} color="#fff" strokeWidth={2.2} />
            <Text className="text-white font-semibold text-[14px]">
              List View
            </Text>
          </>
        ) : (
          <>
            <MapIcon size={16} color="#fff" strokeWidth={2.2} />
            <Text className="text-white font-semibold text-[14px]">
              Map View
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
