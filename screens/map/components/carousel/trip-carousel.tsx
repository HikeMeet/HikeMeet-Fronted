import React from "react";
import {
  FlatList,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import TripCard from "./trip-card";
import { Trip } from "../../../../interfaces/trip-interface";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

export default function TripCarousel({
  trips,
  onOpenPopup,
  onScrollEnd,
}: {
  trips: Trip[];
  onOpenPopup: (t: Trip) => void;
  onScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  return (
    <View className="pb-3">
      <FlatList
        data={trips}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TripCard trip={item} onOpenPopup={() => onOpenPopup(item)} />
        )}
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
        }}
        snapToAlignment="center"
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
      />
    </View>
  );
}
