import React, { useRef, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Trip } from "../../../../interfaces/trip-interface";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TripMarkerProps = {
  trip: Trip;
  longitude: number;
  latitude: number;
  hasAvailability?: boolean;
  isSelected?: boolean;
  onPressMarker: (t: Trip) => void;
};

export default function TripMarker({
  trip,
  longitude,
  latitude,
  hasAvailability,
  isSelected = false,
  onPressMarker,
}: TripMarkerProps) {
  const groupCount = (trip.groups || []).length;
  const imageSize = Math.max(50, Math.min(50, SCREEN_WIDTH * 0.14));
  const ringSize = 4;
  const containerSize = imageSize + ringSize * 1;

  // Animation for scaling when cursor is selected
  const scaleAnim = useRef(new Animated.Value(isSelected ? 1.1 : 1)).current;
  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isSelected ? 1.02 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  // Colors for the trip name label – default based on availability
  const defaultNameBgColor = hasAvailability ? "bg-emerald-100" : "bg-rose-100";
  const defaultNameBorderColor = hasAvailability
    ? "border-emerald-500"
    : "border-rose-500";
  const defaultTextColor = hasAvailability
    ? "text-emerald-800"
    : "text-rose-700";
  const defaultIndicatorColor = hasAvailability
    ? "bg-emerald-600"
    : "bg-rose-600";

  // In selected state (isSelected true), we will update border and label colors to black
  const nameBorderStyle = isSelected ? "border-black" : defaultNameBorderColor;
  const textStyle = defaultTextColor;
  const indicatorStyle = defaultIndicatorColor;

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
        {/* Map image with outer ring */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View className="relative shadow-xl">
            {/* Outer container (ring) */}
            <View
              style={{
                width: containerSize,
                height: containerSize,
                borderRadius: containerSize / 2,
                backgroundColor: isSelected ? "black" : "#ffffff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {trip.main_image?.url ? (
                <Image
                  source={{ uri: trip.main_image.url }}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    borderRadius: imageSize / 2,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: imageSize,
                    height: imageSize,
                    borderRadius: imageSize / 2,
                  }}
                  className="bg-gradient-to-br from-gray-400 to-gray-500 items-center justify-center"
                >
                  <Text className="text-white font-extrabold text-lg">
                    {trip.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {groupCount > 0 && (
              <View className="absolute -top-22 -left-1 bg-green-700 rounded-full w-6 h-6 items-center justify-center border border-white shadow-md">
                <Text className="text-white text-xs font-bold">
                  {groupCount}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Trip name label */}
        <View
          className={`flex-row items-center px-3 py-[6px] rounded-full border shadow-sm ${defaultNameBgColor} ${nameBorderStyle}`}
        >
          <View className={`w-2 h-2 rounded-full mr-2 ${indicatorStyle}`} />
          <Text
            className={`text-[13px] font-semibold ${textStyle}`}
            numberOfLines={1}
          >
            {trip.name}
          </Text>
        </View>
      </TouchableOpacity>
    </Mapbox.MarkerView>
  );
}
