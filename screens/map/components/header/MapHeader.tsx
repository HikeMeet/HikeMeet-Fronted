import React from "react";
import { View } from "react-native";
import CitySearchBar from "./CitySearchBar";
import FiltersBar, { ActiveFilter } from "./FiltersBar";
import ViewModeButton from "./ViewModeButton";

type Props = {
  viewMode: "map" | "list";
  onToggleView: () => void;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
  onOpenTripFilter: () => void;
  onOpenGroupFilter: () => void;
  onSelectCity: (coords: [number, number], place: string) => void;
  onClearCity: () => void;
};

export default function MapHeader({
  viewMode,
  onToggleView,
  activeFilters,
  onRemoveFilter,
  onOpenTripFilter,
  onOpenGroupFilter,
  onSelectCity,
  onClearCity,
}: Props) {
  return (
    <View className="bg-white p-3 shadow-sm">
      <View
        className="flex-row items-center space-x-2"
        style={{ zIndex: 9999 }}
      >
        <View className="flex-1">
          <CitySearchBar
            placeholder="Search city..."
            onSelectLocation={onSelectCity}
            onClearLocation={onClearCity}
          />
        </View>
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
