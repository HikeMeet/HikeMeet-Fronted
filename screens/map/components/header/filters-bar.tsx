import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Users2, Map as MapIcon, X } from "lucide-react-native";
import { palette } from "../../../../utils/theme";
import { ActiveFilter } from "../../../../interfaces/map-interface";

/* ---------- Pill (re-usable) ---------- */
type PillProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  background?: string;
  border?: string;
};

const Pill = ({
  icon,
  label,
  onPress,
  background = palette.gray100,
  border = palette.gray700,
}: PillProps) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center px-4 py-2 rounded-2xl border shadow-sm"
    style={{ backgroundColor: background, borderColor: border }}
  >
    {icon}
    <Text className="ml-2 text-base font-semibold text-gray-900">{label}</Text>
  </Pressable>
);

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
      {/* action pills */}
      <View className="flex-row gap-2">
        <Pill
          icon={<Users2 size={16} color={palette.gray900} />}
          label="Groups"
          onPress={onOpenGroupFilter}
        />

        <Pill
          icon={<MapIcon size={16} color={palette.gray900} />}
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
              className="flex-row items-center bg-teal-500 rounded-xl px-3 py-1"
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
