import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trip } from "../interfaces/trip-interface";

interface TripsManageProps {
  navigation: any;
}

const TripsManage: React.FC<TripsManageProps> = ({ navigation }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/trips/all`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }
        const data: Trip[] = await response.json();
        setTrips(data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Filter trips based on search text
  const filteredTrips = trips.filter((trip) =>
    trip.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* Search bar */}
      <View className="flex-row items-center mb-4">
        <View className="flex-1 mr-2 bg-gray-100 rounded-full px-3 py-2">
          <TextInput
            placeholder="Search trips"
            className="text-base"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView>
          {filteredTrips.map((trip) => (
            <TouchableOpacity
              key={trip._id}
              onPress={() =>
                navigation.navigate("Tabs", {
                  screen: "Trips",
                  params: {
                    screen: "TripPage",
                    params: { tripId: trip._id },
                  },
                })
              }
              className="flex-row items-center bg-gray-100 mb-4 p-4 rounded-lg"
            >
              {trip.images && trip.images.length > 0 ? (
                <Image
                  source={{ uri: trip.images[0] }}
                  className="w-16 h-16 mr-4 rounded"
                />
              ) : (
                <View className="w-16 h-16 bg-gray-300 mr-4 rounded" />
              )}
              <View className="flex-1">
                <Text
                  className="text-lg font-bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {trip.name}
                </Text>
                <Text
                  className="text-sm text-gray-500 break-words"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {trip.location.address}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default TripsManage;
