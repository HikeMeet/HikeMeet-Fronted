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
  const imageSize = Math.max(50, Math.min(72, SCREEN_WIDTH * 0.14));

  return (
    <Mapbox.MarkerView
      coordinate={[longitude, latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <TouchableOpacity
        onPress={() => onPressMarker(trip)}
        activeOpacity={0.9}
        className="items-center"
        style={{ gap: 6 }}
      >
        {/* תמונה עגולה */}
        <View className="relative shadow-xl">
          {trip.main_image?.url ? (
            <Image
              source={{ uri: trip.main_image.url }}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: imageSize / 2,
                borderWidth: 2,
                borderColor: "#ffffff",
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: imageSize / 2,
                borderWidth: 2,
                borderColor: "#ffffff",
              }}
              className="bg-gradient-to-br from-gray-400 to-gray-500 items-center justify-center"
            >
              <Text className="text-white font-extrabold text-lg">
                {trip.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {groupCount > 0 && (
            <View className="absolute -top-22 -left-1 bg-green-700 rounded-full w-6 h-6 items-center justify-center border border-white shadow-md">
              <Text className="text-white text-xs font-bold">{groupCount}</Text>
            </View>
          )}
        </View>

        {/* תגית שם טיול */}
        <View
          className={`flex-row items-center px-3 py-[6px] rounded-full border shadow-sm ${
            hasAvailability
              ? "bg-emerald-100 border-emerald-500"
              : "bg-rose-100 border-rose-500"
          }`}
        >
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              hasAvailability ? "bg-emerald-600" : "bg-rose-600"
            }`}
          />
          <Text
            className={`text-[13px] font-semibold ${
              hasAvailability ? "text-emerald-800" : "text-rose-700"
            }`}
            numberOfLines={1}
          >
            {trip.name}
          </Text>
        </View>
      </TouchableOpacity>
    </Mapbox.MarkerView>
  );
}
