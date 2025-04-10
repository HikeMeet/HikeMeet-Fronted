import React, { forwardRef } from "react";
import { View, Text } from "react-native";
import Constants from "expo-constants";

import CenterOnMeButton from "./center-on-me-button";
import Buildings3D from "./buildings-3D";
import MarkersLayer from "./markers-layer";
import { Trip } from "../../../../interfaces/trip-interface";

// רק אם לא ב-Expo Go נטען את Mapbox
let Mapbox: any = null;
if (Constants.appOwnership !== "expo") {
  Mapbox = require("@rnmapbox/maps").default;
}

type Props = {
  cameraRef: React.RefObject<any>; // אי אפשר לייבא Camera ישירות כאן - נטפל בזה דרך Mapbox.Camera
  trips: Trip[];
  centerCoordinate: [number, number];
  onCenterOnMe: () => void;
  onMarkerPress: (trip: Trip) => void;
  disableControls: boolean;
  selectedTripId?: string | null;
};

export const MapContainer = forwardRef<any, Props>(
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
  ) => {
    if (!Mapbox) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-gray-600">
            Map is disabled in Expo Go. Please use a custom dev client to view
            maps.
          </Text>
        </View>
      );
    }

    const MapView = Mapbox.MapView;
    const Camera = Mapbox.Camera;

    return (
      <View className="flex-1">
        <CenterOnMeButton onPress={onCenterOnMe} disabled={disableControls} />

        <MapView className="flex-1" styleURL={Mapbox.StyleURL.Street}>
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
        </MapView>
      </View>
    );
  }
);
