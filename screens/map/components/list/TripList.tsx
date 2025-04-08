import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import TripRow from "../../../../components/trip-row";
import { Trip } from "../../../../interfaces/trip-interface";

export default function TripList({
  trips,
  navigation,
}: {
  trips: Trip[];
  navigation: any;
}) {
  if (!trips.length) {
    return (
      <Text className="text-center text-gray-500 mt-4">No trips found.</Text>
    );
  }

  return (
    <ScrollView className="flex-1 p-3">
      {trips.map((trip) => (
        <TouchableOpacity
          key={trip._id}
          onPress={() =>
            navigation.navigate("TripsStack", {
              screen: "TripPage",
              params: { tripId: trip._id },
            })
          }
        >
          <TripRow
            trip={trip}
            onPress={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
