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
  userLocation: [number, number] | null;
  onCenterOnMe: () => void;
  onMarkerPress: (trip: Trip) => void;
  /** אם true – כפתור Center מושבת (למשל כש‑popup/modal פתוח) */
  disableControls: boolean;
};

export const MapContainer = forwardRef<Camera, Props>(
  (
    {
      cameraRef,
      trips,
      userLocation,
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
          centerCoordinate={userLocation || [34.7818, 32.0853]}
        />

        <Buildings3D />
        <MarkersLayer trips={trips} onMarkerPress={onMarkerPress} />
      </Mapbox.MapView>
    </View>
  )
);
