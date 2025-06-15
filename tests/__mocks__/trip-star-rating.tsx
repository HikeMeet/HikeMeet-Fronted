import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface TripStarRatingProps {
  tripId: string;
  avgRating: number;
  totalRatings: number;
  yourRating: number;
}

const TripStarRating: React.FC<TripStarRatingProps> = ({
  tripId,
  avgRating,
  totalRatings,
  yourRating,
}) => {
  return (
    <View testID="trip-star-rating">
      <Text testID="avg-rating">Average: {avgRating}</Text>
      <Text testID="total-ratings">Total: {totalRatings}</Text>
      <Text testID="your-rating">Your Rating: {yourRating}</Text>
      <TouchableOpacity testID="rate-trip-button">
        <Text>Rate Trip</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TripStarRating;
