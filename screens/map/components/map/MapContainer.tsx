import React, { forwardRef } from "react";
import { View } from "react-native";
import Mapbox, { Camera } from "@rnmapbox/maps";

import CenterOnMeButton from "./center-on-me-button";
import Buildings3D from "./Buildings3D";
import MarkersLayer from "./MarkersLayer";
import { Trip } from "../../../../interfaces/trip-interface";

type Props = {
  cameraRef: React.RefObject<Camera>;
  trips: Trip[];
  /** נקודה שלפיה ממורכזת המצלמה – searchCenter או userLocation */
  centerCoordinate: [number, number];
  onCenterOnMe: () => void;
  onMarkerPress: (trip: Trip) => void;
  disableControls: boolean;
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
        <MarkersLayer trips={trips} onMarkerPress={onMarkerPress} />
      </Mapbox.MapView>
    </View>
  )
);
