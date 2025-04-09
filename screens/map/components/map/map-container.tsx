import React, { forwardRef } from "react";
import { View } from "react-native";
import Mapbox, { Camera } from "@rnmapbox/maps";

import CenterOnMeButton from "./center-on-me-button";
import Buildings3D from "./buildings-3D";
import MarkersLayer from "./markers-layer";
import { Trip } from "../../../../interfaces/trip-interface";

type Props = {
  cameraRef: React.RefObject<Camera>;
  trips: Trip[];
  centerCoordinate: [number, number];
  onCenterOnMe: () => void;
  onMarkerPress: (trip: Trip) => void;
  disableControls: boolean;
  selectedTripId?: string | null;
};

export const MapContainer = forwardRef<Camera, Props>(
  (
    {
      cameraRef,
      trips,
      centerCoordinate,
      onCenterOnMe,
      onMarkerPress,
      disableControls,
      selectedTripId,
    },
    _ref
  ) => (
    <View className="flex-1">
      <CenterOnMeButton onPress={onCenterOnMe} disabled={disableControls} />

      <Mapbox.MapView className="flex-1" styleURL={Mapbox.StyleURL.Street}>
        <Camera
          ref={cameraRef}
          zoomLevel={13}
          pitch={0}
          centerCoordinate={centerCoordinate}
        />

        <Buildings3D />
        <MarkersLayer
          trips={trips}
          onMarkerPress={onMarkerPress}
          selectedTripId={selectedTripId}
        />
      </Mapbox.MapView>
    </View>
  )
);
