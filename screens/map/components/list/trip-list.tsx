import React from "react";
import { ScrollView, Text } from "react-native";
import TripRow from "../../../../components/trip-row";
import { Trip } from "../../../../interfaces/trip-interface";

type Props = {
  trips: Trip[];
  onOpenTrip: (trip: Trip) => void;
  onScrollStart: () => void;
};

export default function TripList({ trips, onOpenTrip, onScrollStart }: Props) {
  if (!trips.length) {
    return (
      <Text className="text-center text-gray-500 mt-4">No trips found.</Text>
    );
  }

  return (
    <ScrollView className="flex-1 p-3" onScrollBeginDrag={onScrollStart}>
      {trips.map((trip) => (
        <TripRow key={trip._id} trip={trip} onPress={() => onOpenTrip(trip)} />
      ))}
    </ScrollView>
  );
}
