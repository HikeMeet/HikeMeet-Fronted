import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Trip } from "../../../interfaces/trip-interface";
import TripStarRating from "./starts-rating";

interface TripRowProps {
  trip: Trip;
  onPress: () => void;
  completedAt?: Date | null;
  fromMap?: boolean;
  smallImage?: boolean; // חדש
  ismap?: boolean;
}

const TripRow: React.FC<TripRowProps> = ({
  trip,
  onPress,
  completedAt,
  fromMap,
  smallImage = false,
  ismap,
}) => {
  const containerBg = fromMap ? "bg-white" : "bg-gray-100";

  // אם smallImage = true => w-10 h-10, אחרת w-16 h-16
  const imageSizeClass = smallImage ? "w-2 h-2" : "w-16 h-16";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`relative flex-row items-center ${containerBg} mb-4 p-4 rounded-lg`}
    >
      {trip.main_image ? (
        <Image
          source={{ uri: trip.main_image.url }}
          className={`${imageSizeClass} mr-4 rounded`}
        />
      ) : (
        <View className={`${imageSizeClass} bg-gray-300 mr-4 rounded`} />
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

      {completedAt && (
        <Text className="absolute top-2 right-2 text-xs text-gray-600">
          {new Date(completedAt).toLocaleDateString()}
        </Text>
      )}
      {ismap && (
        <View className="absolute bottom-12 right-3">
          <TripStarRating
            tripId={trip._id}
            avgRating={trip.avg_rating ?? 0}
            totalRatings={trip.ratings?.length ?? 0}
            yourRating={0}
            ismap
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default TripRow;
