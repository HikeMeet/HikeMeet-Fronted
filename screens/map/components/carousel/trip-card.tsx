import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { Trip } from "../../../../interfaces/trip-interface";
import LtrText from "../../../../components/ltr-text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TripCard({
  trip,
  onOpenPopup,
}: {
  trip: Trip;
  onOpenPopup: () => void;
}) {
  const activeGroupsCount =
    trip.groups?.filter((g) => g.status === "planned" || "active").length || 0;

  return (
    <View
      className="bg-white rounded-3xl shadow-xl p-4 mx-2"
      style={{ width: SCREEN_WIDTH * 0.85 }}
    >
      <LtrText className="text-base font-bold text-gray-900 mb-1">
        {trip.name}
      </LtrText>
      <LtrText className="text-xs text-gray-500">
        {trip.location.address}
      </LtrText>

      {trip.main_image?.url && (
        <Image
          source={{ uri: trip.main_image.url }}
          className="w-full h-70 rounded-md mt-3"
          resizeMode="cover"
        />
      )}

      <Text className="text-xs mt-2 text-gray-600">
        {activeGroupsCount} active groups
      </Text>

      <TouchableOpacity
        onPress={onOpenPopup}
        className="bg-emerald-600 rounded-md py-2 px-4 mt-3"
      >
        <Text className="text-white text-center font-semibold">
          View Groups
        </Text>
      </TouchableOpacity>
    </View>
  );
}
