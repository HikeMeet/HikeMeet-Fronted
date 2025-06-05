// src/components/TripStarRating.tsx

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../contexts/auth-context";

interface TripStarRatingProps {
  tripId: string;
  avgRating: number;
  totalRatings: number;
  yourRating: number;
  onRated?: (avg: number, you: number, total: number) => void;
  /** Base size for interactive stars; avg stars will be 2/3 of this */
  size?: number;
  color?: string;
  ismap?: boolean;
}

const TripStarRating: React.FC<TripStarRatingProps> = ({
  tripId,
  avgRating: initialAvg,
  totalRatings: initialTotal,
  yourRating: initialYour,
  onRated,
  size = 24,
  color = "#FFD700",
  ismap,
}) => {
  const { mongoUser } = useAuth();
  const userId = mongoUser!._id;

  const [avgRating, setAvgRating] = useState(initialAvg);
  const [totalRatings, setTotalRatings] = useState(initialTotal);
  const [yourRating, setYourRating] = useState(initialYour);

  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<number>(yourRating);
  const [saving, setSaving] = useState(false);

  const submitRating = async () => {
    if (!userId) {
      return Alert.alert("Login required", "You must be logged in to rate.");
    }
    if (selected < 1 || selected > 5) {
      return Alert.alert("Select a star", "Tap one of the stars first.");
    }
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/trips/${tripId}/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: selected, userId }),
        }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Rating failed");

      setAvgRating(body.avg_rating);
      setTotalRatings(body.total_ratings);
      setYourRating(body.your_rating);
      onRated?.(body.avg_rating, body.your_rating, body.total_ratings);
      setModalVisible(false);
    } catch (err: any) {
      console.error("Error saving rating:", err);
      Alert.alert("Error", err.message || "Could not save rating.");
    } finally {
      setSaving(false);
    }
  };

  const renderStaticStars = (value: number, starSize: number) => (
    <View className="flex-row">
      {Array.from({ length: 5 }).map((_, idx) => {
        const num = idx + 1;
        let name: React.ComponentProps<typeof Ionicons>["name"] =
          "star-outline";
        if (value >= num) name = "star";
        else if (value >= num - 0.5) name = "star-half";
        return (
          <Ionicons
            key={idx}
            name={name}
            size={starSize}
            color={color}
            className="mx-1"
          />
        );
      })}
    </View>
  );

  return (
    <View className="items-center">
      {ismap ? (
        <View className="mt-9">
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={() => {
                setSelected(yourRating || 0);
                setModalVisible(true);
              }}
              className="p-1 bg-green-500 rounded-full items-center justify-center"
            >
              <Ionicons name="star-outline" size={size * 0.7} color="#fff" />
            </TouchableOpacity>
            <Text className="text-base font-semibold">
              {avgRating.toFixed(1)}
            </Text>
          </View>
        </View>
      ) : (
        // regular
        <>
          <View className="flex-row items-center">
            {renderStaticStars(avgRating, size * 0.66)}

            <TouchableOpacity
              onPress={() => {
                setSelected(yourRating || 0);
                setModalVisible(true);
              }}
              className="mx-0.5 p-1 bg-green-500 rounded-full items-center justify-center"
            >
              <Ionicons name="star-outline" size={size * 0.4} color="#fff" />
            </TouchableOpacity>

            <Text className="text-lg font-semibold">
              {avgRating.toFixed(1)}
            </Text>
          </View>

          <Text className="text-xs text-gray-600  ">
            ({totalRatings} ratings)
          </Text>
        </>
      )}

      {/* Rating Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="w-4/5 bg-white rounded-lg p-4 items-center">
            <Text className="text-lg font-semibold mb-3">Rate this trip</Text>

            {saving ? (
              <ActivityIndicator size="large" />
            ) : (
              <View className="flex-row my-2">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const num = idx + 1;
                  const name = selected >= num ? "star" : "star-outline";
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelected(num)}
                      className="mx-1"
                    >
                      <Ionicons name={name} size={size} color={color} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View className="flex-row justify-between w-full mt-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="px-4 py-2 bg-gray-300 rounded"
                disabled={saving}
              >
                <Text className="text-gray-800">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitRating}
                className="px-4 py-2 bg-green-500 rounded"
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white">Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TripStarRating;
