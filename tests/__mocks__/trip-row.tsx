import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

interface TripRowProps {
  trip: any;
  completedAt?: string;
  onPress: () => void;
}

const TripRow: React.FC<TripRowProps> = ({ trip, completedAt, onPress }) => {
  return (
    <TouchableOpacity testID={`trip-row-${trip._id}`} onPress={onPress}>
      <View style={{ padding: 10, borderBottomWidth: 1, borderColor: "#eee" }}>
        <Text testID={`trip-name-${trip._id}`}>{trip.name}</Text>
        <Text testID={`trip-location-${trip._id}`}>
          {trip.location?.address || "Unknown location"}
        </Text>
        {completedAt && (
          <Text testID={`trip-completed-${trip._id}`}>
            Completed: {completedAt}
          </Text>
        )}
        {trip.tags && trip.tags.length > 0 && (
          <Text testID={`trip-tags-${trip._id}`}>
            Tags: {trip.tags.join(", ")}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default TripRow;
