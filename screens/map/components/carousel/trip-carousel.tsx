import React, { useRef } from "react";
import {
  ScrollView,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import TripCard from "./trip-card";
import { Trip } from "../../../../interfaces/trip-interface";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TripCarousel({
  trips,
  onOpenPopup,
  onScrollEnd,
}: {
  trips: Trip[];
  onOpenPopup: (t: Trip) => void;
  onScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View className="pb-3">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH * 0.85 + 10}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {trips.map((trip) => (
          <TripCard
            key={trip._id}
            trip={trip}
            onOpenPopup={() => onOpenPopup(trip)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
