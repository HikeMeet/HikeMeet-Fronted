import React, { useRef, useEffect } from "react";
import { Animated, Dimensions } from "react-native";
import { theme } from "../../../../utils/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CarouselPanelProps {
  visible: boolean;
  children: React.ReactNode;
}

export default function CarouselPanel({
  visible,
  children,
}: CarouselPanelProps) {
  const translateY = useRef(new Animated.Value(visible ? 0 : 700)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 700,
      duration: theme.animation.fast,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        transform: [{ translateY }],
      }}
      pointerEvents={visible ? "auto" : "none"}
    >
      {children}
    </Animated.View>
  );
}
