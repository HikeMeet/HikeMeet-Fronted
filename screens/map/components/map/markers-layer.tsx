import React from "react";
import TripMarker from "./trip-marker";
import { Trip } from "../../../../interfaces/trip-interface";

type Props = {
  trips: Trip[];
  onMarkerPress: (trip: Trip) => void;
  selectedTripId?: string | null;
};

export default function MarkersLayer({
  trips,
  onMarkerPress,
  selectedTripId,
}: Props) {
  // Default value for spacing between symbols (~10-12 meters, depending on where on the globe)
  // The smaller the number - the closer the symbols will be to each other.
  // Can be changed to 0.00003 or 0.00005 etc. as needed.
  const SCATTER_RADIUS = 0.00006;

  // Dictionary to track duplicates - if multiple trips appear at the same location
  const markersCountByCoord: Record<string, number> = {};

  return (
    <>
      {trips.map((trip) => {
        const [lon, lat] = trip.location.coordinates;
        const coordKey = `${lon}_${lat}`;

        // Check how many markers have already been placed at that point
        const duplicateIndex = markersCountByCoord[coordKey] || 0;
        markersCountByCoord[coordKey] = duplicateIndex + 1;

        // Calculate the new coordinates
        let adjustedLon = lon;
        let adjustedLat = lat;

        if (duplicateIndex > 0) {
          // Choose an angle by appearance (duplicateIndex) to spread them in a different direction for each marker
          const angle = duplicateIndex * (Math.PI / 2);
          adjustedLon = lon + SCATTER_RADIUS * Math.cos(angle);
          adjustedLat = lat + SCATTER_RADIUS * Math.sin(angle);
        }

        const hasAvailability = trip.groups?.some(
          (g) => g.members.length < g.max_members
        );

        return (
          <TripMarker
            key={trip._id}
            trip={trip}
            longitude={adjustedLon}
            latitude={adjustedLat}
            hasAvailability={hasAvailability}
            isSelected={trip._id === selectedTripId}
            onPressMarker={() => onMarkerPress(trip)}
          />
        );
      })}
    </>
  );
}
