import React from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Trip } from "../map-page";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const groupCount = (trip.groups || []).length;

  // Dynamic size based on screen width (between 40 and 64)
  const imageSize = Math.max(40, Math.min(64, SCREEN_WIDTH * 0.12));

  return (
    <Mapbox.MarkerView
      coordinate={[longitude, latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <TouchableOpacity
        onPress={() => onPressMarker(trip)}
        activeOpacity={0.9}
        className="items-center"
      >
        <View className="relative mb-1 shadow-lg">
          {trip.main_image?.url ? (
            <Image
              source={{ uri: trip.main_image.url }}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: imageSize / 2,
                borderWidth: 3,
                borderColor: "white",
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: imageSize / 2,
                borderWidth: 3,
                borderColor: "white",
              }}
              className="bg-gray-400 items-center justify-center"
            >
              <Text className="text-white font-bold text-xl">
                {trip.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {groupCount > 0 && (
            <View className="absolute -top-1 -left-1 bg-purple-700 rounded-full w-6 h-6 items-center justify-center border border-white shadow-md">
              <Text className="text-white text-xs font-bold">{groupCount}</Text>
            </View>
          )}
        </View>

        <View
          className={`px-3 py-1 mt-1 rounded-full shadow-sm ${
            hasAvailability ? "bg-green-600" : "bg-red-500"
          }`}
        >
          <Text className="text-white text-sm font-semibold">{trip.name}</Text>
        </View>
      </TouchableOpacity>
    </Mapbox.MarkerView>
  );
}
