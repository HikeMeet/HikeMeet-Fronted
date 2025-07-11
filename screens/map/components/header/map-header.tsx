import React from "react";
import { View } from "react-native";
import FiltersBar from "./filters-bar";
import ViewModeButton from "./view-mode-button";
import { ActiveFilter } from "../../../../interfaces/map-interface";

type Props = {
  viewMode: "map" | "list";
  onToggleView: () => void;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
  onOpenTripFilter: () => void;
  onOpenGroupFilter: () => void;
};

export default function MapHeader({
  viewMode,
  onToggleView,
  activeFilters,
  onRemoveFilter,
  onOpenTripFilter,
  onOpenGroupFilter,
}: Props) {
  return (
    <View className="bg-white p-3 shadow-sm rounded-2xl space-y-3">
      {/* Filters Bar above */}
      <View className="absolute top-3 right-3 z-10">
        <ViewModeButton viewMode={viewMode} onToggle={onToggleView} />
      </View>

      <FiltersBar
        filters={activeFilters}
        onRemoveFilter={onRemoveFilter}
        onOpenTripFilter={onOpenTripFilter}
        onOpenGroupFilter={onOpenGroupFilter}
      />
    </View>
  );
}
