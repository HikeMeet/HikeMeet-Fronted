// TripsPage.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trip } from "../../interfaces/trip-interface";
import TripRow from "../../components/trip-row";

interface UserTripProps {
  route: any;
  navigation: any;
}

const TripsPage: React.FC<UserTripProps> = ({ navigation }) => {
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

  const filteredTrips = trips.filter((trip) =>
    trip.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* Top row: Search and Filter */}
      <View className="flex-row items-center mb-4">
        <View className="flex-1 mr-2 bg-gray-100 rounded-full px-3 py-2">
          <TextInput
            placeholder="Search trip"
            className="text-base"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity className="p-2 bg-gray-200 rounded-full">
          <Text className="text-sm">Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons row: Trip History and + Add Trip */}
      <View className="flex-row justify-between mb-4">
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded">
          <Text className="text-white font-semibold">Trip History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("TripsStack")}
          className="bg-green-500 px-4 py-2 rounded"
        >
          <Text className="text-white font-semibold">+ Add trip</Text>
        </TouchableOpacity>
      </View>

      {/* Trip List */}
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          filteredTrips.map((trip) => (
            <TripRow
              key={trip._id}
              trip={trip}
              onPress={() =>
                navigation.navigate("TripsStack", {
                  screen: "TripPage",
                  params: { tripId: trip._id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripsPage;
