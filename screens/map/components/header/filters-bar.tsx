import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Users2, Map as MapIcon, X } from "lucide-react-native";
import { palette } from "../../../../utils/theme";
import { ActiveFilter } from "../../../../interfaces/map-interface";

/* ---------- Pill (with visual feedback only while pressed) ---------- */
type PillProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

const Pill = ({ icon, label, onPress }: PillProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const animate = (to: number, callback?: () => void) => {
    Animated.timing(scale, {
      toValue: to,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(callback);
  };

  const backgroundColor = isPressed ? palette.primary : palette.gray100;
  const borderColor = isPressed ? palette.primary : palette.gray700;
  const textColor = isPressed ? "#fff" : palette.gray900;
  const iconColor = isPressed ? "#fff" : palette.gray900;

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        marginRight: 6,
      }}
    >
      <Pressable
        onPressIn={() => {
          setIsPressed(true);
          animate(0.96);
        }}
        onPressOut={() => {
          setIsPressed(false);
          animate(1, onPress);
        }}
        className="flex-row items-center px-2 py-1.5 rounded-3xl border shadow-sm"
        style={{ backgroundColor, borderColor }}
      >
        {React.cloneElement(icon as React.ReactElement, { color: iconColor })}
        <Text
          className="ml-2 text-base font-semibold"
          style={{ color: textColor }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

/* ---------- FiltersBar ---------- */
type FiltersBarProps = {
  filters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
  onOpenTripFilter: () => void;
  onOpenGroupFilter: () => void;
};

export default function FiltersBar({
  filters,
  onRemoveFilter,
  onOpenTripFilter,
  onOpenGroupFilter,
}: FiltersBarProps) {
  return (
    <View className="gap-2">
      {/* action pills row */}
      <View className="flex-row">
        <Pill
          icon={<Users2 size={16} />}
          label="Groups"
          onPress={onOpenGroupFilter}
        />
        <Pill
          icon={<MapIcon size={16} />}
          label="Trips"
          onPress={onOpenTripFilter}
        />
      </View>

      {/* active chips */}
      {filters.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 2 }}
          className="pt-1"
        >
          {filters.map((f) => (
            <View
              key={f.id}
              className="flex-row items-center bg-teal-500 rounded-xl px-3 py-1 mr-2"
            >
              <Text className="text-white text-sm mr-2">{f.label}</Text>
              <Pressable
                onPress={() => onRemoveFilter(f.id)}
                hitSlop={6}
                className="w-4 h-4 rounded-full bg-gray-900 items-center justify-center"
              >
                <X size={10} color="#fff" strokeWidth={3} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
