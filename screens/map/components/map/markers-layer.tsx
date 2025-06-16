import React from "react";
import TripMarker from "./trip-marker";
import { Trip } from "../../../../interfaces/trip-interface";
import { TouchableOpacity, View, Text } from "react-native";
import Constants from "expo-constants";

let Mapbox: any = null;
if (Constants.appOwnership !== "expo") {
  Mapbox = require("@rnmapbox/maps").default;
}

type Props = {
  trips: Trip[];
  onMarkerPress: (trip: Trip) => void;
  selectedTripId?: string | null;
  addTripMarkerLocation?: [number, number] | null;
  onAddTripMarkerPress?: () => void;
};

export default function MarkersLayer({
  trips,
  onMarkerPress,
  selectedTripId,
  addTripMarkerLocation,
  onAddTripMarkerPress,
}: Props) {
  const SCATTER_RADIUS = 0.00006;
  const markersCountByCoord: Record<string, number> = {};

  return (
    <>
      {trips.map((trip) => {
        const [lon, lat] = trip.location.coordinates;
        const coordKey = `${lon}_${lat}`;
        const duplicateIndex = markersCountByCoord[coordKey] || 0;
        markersCountByCoord[coordKey] = duplicateIndex + 1;

        let adjustedLon = lon;
        let adjustedLat = lat;

        if (duplicateIndex > 0) {
          const angle = duplicateIndex * (Math.PI / 2);
          adjustedLon = lon + SCATTER_RADIUS * Math.cos(angle);
          adjustedLat = lat + SCATTER_RADIUS * Math.sin(angle);
        }

        const hasAvailability = trip.groups?.some(
          (g) => g.members.length < g.max_members
        );

        return (
          <TripMarker
            key={trip._id}
            trip={trip}
            longitude={adjustedLon}
            latitude={adjustedLat}
            hasAvailability={hasAvailability}
            isSelected={trip._id === selectedTripId}
            onPressMarker={() => onMarkerPress(trip)}
          />
        );
      })}

      {addTripMarkerLocation && Mapbox && (
        <Mapbox.MarkerView
          key="add-trip-marker"
          coordinate={addTripMarkerLocation}
          anchor={{ x: 0.5, y: 0.3 }}
        >
          <TouchableOpacity
            onPress={onAddTripMarkerPress}
            activeOpacity={0.9}
            className="items-center"
          >
            <View className="bg-[#247875] w-11 h-11 rounded-full items-center justify-center border-2 border-white mb-0.5">
              <Text className="text-white text-[20px] font-bold">+</Text>
            </View>
            <View className="bg-[#ECF9F9] rounded-2xl px-2.5 py-1 border border-[#ECF9F9]">
              <Text className="text-[#144543] font-bold text-s">add trip</Text>
            </View>
          </TouchableOpacity>
        </Mapbox.MarkerView>
      )}
    </>
  );
}
