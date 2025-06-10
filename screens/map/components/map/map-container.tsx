import React, { forwardRef, useState, useRef, useEffect } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import Constants from "expo-constants";

import CenterOnMeButton from "./center-on-me-button";
import Buildings3D from "./buildings-3D";
import MarkersLayer from "./markers-layer";
import { Trip } from "../../../../interfaces/trip-interface";
import InfoIcon from "../../../../assets/info.svg";

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
  onPress?: () => void;
  onMapMove?: () => void;
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
    const [showHint, setShowHint] = useState(false);
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const animatedTranslate = useRef(new Animated.Value(-10)).current;

    const closeHint = () => {
      if (showHint) setShowHint(false);
    };

    useEffect(() => {
      if (showHint) {
        Animated.parallel([
          Animated.timing(animatedOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(animatedTranslate, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(animatedOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(animatedTranslate, {
            toValue: -10,
            duration: 150,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [showHint]);

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
        <CenterOnMeButton
          onPress={() => {
            closeHint();
            onCenterOnMe();
          }}
          visible={!hideControls}
        />

        {!hideControls && (
          <View className="absolute top-5 right-4 z-10 items-end">
            <Pressable
              onPress={() => setShowHint((prev) => !prev)}
              className="bg-white/90 p-2 rounded-full shadow-sm"
            >
              <InfoIcon width={20} height={20} />
            </Pressable>

            <Animated.View
              pointerEvents={showHint ? "auto" : "none"}
              style={{
                opacity: animatedOpacity,
                transform: [{ translateY: animatedTranslate }],
              }}
              className="mt-2 bg-white/90 rounded-lg shadow-md px-3 py-2 max-w-[220px]"
            >
              <Text className="text-[11px] text-gray-800 text-center font-medium mb-1">
                Press and hold to add trip 💡
              </Text>
              <Text className="text-[10px] text-gray-700">
                ● <Text className="text-emerald-700 font-semibold">Green</Text>:
                groups available{"\n"}●{" "}
                <Text className="text-rose-700 font-semibold">Red</Text>: no
                availability group{"\n"}● Number = how many groups in trip
              </Text>
            </Animated.View>
          </View>
        )}

        <MapView
          className="flex-1"
          styleURL={Mapbox.StyleURL.Street}
          onPress={() => {
            closeHint();
            onPress?.();
          }}
          onLongPress={
            onLongPress
              ? (feature: any) => {
                  closeHint();
                  const coordinates = feature.geometry.coordinates as [
                    number,
                    number,
                  ];
                  onLongPress(coordinates);
                }
              : undefined
          }
          onCameraChanged={() => {
            closeHint();
            onMapMove?.();
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
            onMarkerPress={(trip) => {
              closeHint();
              onMarkerPress(trip);
            }}
            selectedTripId={selectedTripId}
            addTripMarkerLocation={addTripMarkerLocation}
            onAddTripMarkerPress={() => {
              closeHint();
              onAddTripMarkerPress?.();
            }}
          />
        </MapView>
      </View>
    );
  }
);
