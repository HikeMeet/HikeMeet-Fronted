import React from "react";
import { View, ActivityIndicator } from "react-native";
import { MapContainer } from "./map/map-container";
import TripCarousel from "./carousel/trip-carousel";
import TripList from "./list/trip-list";
import CarouselPanel from "./carousel/carousel-panel";
import { Trip } from "../../../interfaces/trip-interface";
import { Coordinate, ViewMode } from "../../../interfaces/map-interface";
import { theme } from "../../../utils/theme";

interface MapContentProps {
  trips: Trip[];
  viewMode: ViewMode;
  loading: boolean;
  centerCoordinate: Coordinate;
  carouselVisible: boolean;
  selectedTripId: string | null;
  hideControls: boolean;
  cameraRef: React.MutableRefObject<any>;
  onCenterOnMe: () => void;
  onMarkerPress: (trip: Trip) => void;
  onOpenPopup: (trip: Trip) => void;
  onScrollEnd: (event: any) => void;
  onListScrollStart: () => void;
  onLongPress?: (coordinates: [number, number]) => void;
  addTripMarkerLocation?: [number, number] | null;
  onAddTripMarkerPress?: () => void;
}

export default function MapContent({
  trips,
  viewMode,
  loading,
  centerCoordinate,
  carouselVisible,
  selectedTripId,
  hideControls,
  cameraRef,
  onCenterOnMe,
  onMarkerPress,
  onOpenPopup,
  onScrollEnd,
  onListScrollStart,
  onLongPress,
  addTripMarkerLocation,
  onAddTripMarkerPress,
}: MapContentProps) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (viewMode === "list") {
    return (
      <TripList
        trips={trips}
        onOpenTrip={onOpenPopup}
        onScrollStart={onListScrollStart}
      />
    );
  }

  return (
    <>
      <MapContainer
        cameraRef={cameraRef}
        trips={trips}
        centerCoordinate={centerCoordinate}
        onCenterOnMe={onCenterOnMe}
        onMarkerPress={onMarkerPress}
        hideControls={hideControls}
        selectedTripId={selectedTripId}
        onLongPress={onLongPress}
        addTripMarkerLocation={addTripMarkerLocation}
        onAddTripMarkerPress={onAddTripMarkerPress}
      />

      <CarouselPanel visible={carouselVisible && trips.length > 0}>
        <TripCarousel
          trips={trips}
          onOpenPopup={onOpenPopup}
          onScrollEnd={onScrollEnd}
        />
      </CarouselPanel>
    </>
  );
}

// Re-export the camera ref type for external use
export type MapCameraRef = React.MutableRefObject<any>;
