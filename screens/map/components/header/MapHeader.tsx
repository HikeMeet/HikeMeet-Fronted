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
  cityQuery: string;
  setCityQuery: (q: string) => void;
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
  cityQuery,
  setCityQuery,
}: Props) {
  return (
    <View className="bg-white p-3 shadow-sm">
      <View
        className="flex-row items-center space-x-2"
        style={{ zIndex: 9999 }}
      >
        <View className="flex-1">
          <CitySearchBar
            value={cityQuery}
            onChangeText={setCityQuery}
            placeholder="Search city..."
            onSelectLocation={onSelectCity}
            onClearLocation={() => {
              const cityFilter = activeFilters.find((f) =>
                f.id.startsWith("city=")
              );
              if (cityFilter) {
                onRemoveFilter(cityFilter.id); // ← הסרה מהפילטרים
              } else {
                onClearCity(); // ← גיבוי, אם לא קיים פילטר (נדיר)
              }
            }}
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
