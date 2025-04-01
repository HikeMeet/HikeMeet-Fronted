// screens/map/components/TripMarker.tsx

import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Trip } from "../map-page";

type TripMarkerProps = {
  trip: Trip;
  longitude: number;
  latitude: number;
  hasAvailability?: boolean;
  onPressMarker: (t: Trip) => void;
};

export default function TripMarker({
  trip,
  longitude,
  latitude,
  hasAvailability,
  onPressMarker,
}: TripMarkerProps) {
  return (
    <Mapbox.MarkerView
      coordinate={[longitude, latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <TouchableOpacity
        onPress={() => onPressMarker(trip)}
        activeOpacity={0.8}
        className="flex items-center"
      >
        {/* אם לטיול יש main_image.url, מציגים בתור תמונה עגולה */}
        {trip.main_image?.url ? (
          <Image
            source={{ uri: trip.main_image.url }}
            className="w-10 h-10 rounded-full border-2 border-white mb-1"
            resizeMode="cover"
          />
        ) : (
          /* אחרת, placeholder עגול עם אות ראשונה */
          <View className="w-10 h-10 rounded-full bg-gray-400 mb-1 items-center justify-center">
            <Text className="text-white font-bold">
              {trip.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* תגית קטנה עם שם הטיול + צבע לפי hasAvailability */}
        <View
          className={`px-2 py-1 rounded-full shadow ${
            hasAvailability ? "bg-green-600" : "bg-red-500"
          }`}
        >
          <Text className="text-white text-sm font-semibold">{trip.name}</Text>
        </View>
      </TouchableOpacity>
    </Mapbox.MarkerView>
  );
}
