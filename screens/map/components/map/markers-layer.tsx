import React from "react";
import TripMarker from "./trip-marker";
import { Trip } from "../../../../interfaces/trip-interface";

type Props = {
  trips: Trip[];
  onMarkerPress: (trip: Trip) => void;
};

export default function MarkersLayer({ trips, onMarkerPress }: Props) {
  return (
    <>
      {trips.map((trip) => {
        const [lon, lat] = trip.location.coordinates;
        const hasAvailability = trip.groups?.some(
          (g) => g.members.length < g.max_members
        );
        return (
          <TripMarker
            key={trip._id}
            trip={trip}
            longitude={lon}
            latitude={lat}
            hasAvailability={hasAvailability}
            onPressMarker={() => onMarkerPress(trip)}
          />
        );
      })}
    </>
  );
}
