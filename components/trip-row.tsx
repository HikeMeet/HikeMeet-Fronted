// TripRow.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Trip } from "../interfaces/trip-interface";

interface TripRowProps {
  trip: Trip;
  onPress: () => void;
}

const TripRow: React.FC<TripRowProps> = ({ trip, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-gray-100 mb-4 p-4 rounded-lg"
    >
      {trip.main_image ? (
        <Image
          source={{ uri: trip.main_image.url }}
          className="w-16 h-16 mr-4 rounded"
        />
      ) : (
        <View className="w-16 h-16 bg-gray-300 mr-4 rounded" />
      )}
      <View className="flex-1">
        <Text
          className="text-lg font-bold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {trip.name}
        </Text>
        <Text
          className="text-sm text-gray-500 break-words"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {trip.location.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TripRow;
