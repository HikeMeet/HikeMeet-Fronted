// screens/map/components/TripMarker.tsx
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Trip } from "../map-page";

type TripMarkerProps = {
  trip: Trip;
  longitude: number;
  latitude: number;
  hasAvailability: boolean;
  onPressMarker: (t: Trip) => void;
};

export default function TripMarker({
  trip,
  longitude,
  latitude,
  hasAvailability,
  onPressMarker,
}: TripMarkerProps) {
  const markerColor = hasAvailability ? "bg-green-600" : "bg-red-500";

  return (
    <Mapbox.MarkerView
      coordinate={[longitude, latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <TouchableOpacity
        onPress={() => onPressMarker(trip)}
        className={`flex items-center justify-center px-3 py-2 rounded-full ${markerColor} shadow-md`}
      >
        <Text className="text-white font-bold text-center">{trip.name}</Text>
      </TouchableOpacity>
    </Mapbox.MarkerView>
  );
}
