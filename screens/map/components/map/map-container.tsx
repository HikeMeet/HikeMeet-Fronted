import React, { forwardRef } from "react";
import { View, Text } from "react-native";
import Constants from "expo-constants";

import CenterOnMeButton from "./center-on-me-button";
import Buildings3D from "./buildings-3D";
import MarkersLayer from "./markers-layer";
import { Trip } from "../../../../interfaces/trip-interface";

let Mapbox: any = null;
if (Constants.appOwnership !== "expo") {
  Mapbox = require("@rnmapbox/maps").default;
}

type Props = {
  cameraRef: React.RefObject<any>;
  trips: Trip[];
  centerCoordinate: [number, number];
  onCenterOnMe: () => void;
  onMarkerPress: (trip: Trip) => void;
  hideControls: boolean;
  selectedTripId?: string | null;
  onLongPress?: (coordinates: [number, number]) => void;
  addTripMarkerLocation?: [number, number] | null;
  onAddTripMarkerPress?: () => void;
  onPress?: () => void; // ✅ הוספה כאן
  onMapMove?: () => void; // ← חדש
};

export const MapContainer = forwardRef<any, Props>(
  (
    {
      cameraRef,
      trips,
      centerCoordinate,
      onCenterOnMe,
      onMarkerPress,
      hideControls,
      selectedTripId,
      onLongPress,
      addTripMarkerLocation,
      onAddTripMarkerPress,
      onPress,
      onMapMove,
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
        <CenterOnMeButton onPress={onCenterOnMe} visible={!hideControls} />

        {/* Add Trip Hint - positioned inside map */}
        {!hideControls && (
          <View className="absolute top-5 right-4 bg-white/90 rounded-lg shadow-sm px-3 py-2 max-w-[200px] z-10">
            <Text className="text-[11px] text-gray-800 text-center font-medium mb-1">
              Press and hold to add trip 💡
            </Text>
            <Text className="text-[10px] text-gray-700">
              ● <Text className="text-emerald-700 font-semibold">Green</Text>:
              groups available{"\n"}●{" "}
              <Text className="text-rose-700 font-semibold">Red</Text>: no
              availability group{"\n"}● Number = how many groups in trip
            </Text>
          </View>
        )}

        <MapView
          className="flex-1"
          styleURL={Mapbox.StyleURL.Street}
          onPress={() => {
            onPress?.();
          }}
          onLongPress={
            onLongPress
              ? (feature: any) => {
                  const coordinates = feature.geometry.coordinates as [
                    number,
                    number,
                  ];
                  onLongPress(coordinates);
                }
              : undefined
          }
          onCameraChanged={() => {
            // כאן תוכל לבטל פופאפ או add marker
            onMapMove?.(); // נשלח את זה כפרופ למעלה
          }}
        >
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
            addTripMarkerLocation={addTripMarkerLocation}
            onAddTripMarkerPress={onAddTripMarkerPress}
          />
        </MapView>
      </View>
    );
  }
);
