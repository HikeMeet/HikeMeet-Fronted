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
import { useAuth } from "../../contexts/auth-context";
import { ITripHistoryEntry } from "../../interfaces/user-interface";

interface UserTripProps {
  route: any;
  navigation: any;
}

const TripsPage: React.FC<UserTripProps> = ({ navigation }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsHistory, setTripsHistory] = useState<ITripHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const { mongoUser } = useAuth();
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

  useEffect(() => {
    fetchTrips();
  }, []);

  // Function to fetch trips from the user's trip history.
  const fetchTripHistory = async () => {
    try {
      setLoading(true);
      // Extract trip IDs from the user's trip_history.
      const tripIds = mongoUser!.trip_history.map((entry) => entry.trip);

      setTripsHistory(mongoUser!.trip_history);
      if (tripIds.length === 0) {
        setTrips([]); // No history entries.
        return;
      }
      // Build a comma-separated string of IDs.
      const idsString = tripIds.join(",");
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/trips/list-by-ids?ids=${idsString}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch trip history");
      }
      const data: Trip[] = await response.json();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trip history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between all trips and trip history.
  const toggleTrips = () => {
    if (!showHistory) {
      // Show trip history.
      fetchTripHistory();
    } else {
      // Show all trips.
      fetchTrips();
    }
    setShowHistory(!showHistory);
  };

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
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded"
          onPress={toggleTrips}
        >
          <Text className="text-white font-semibold">
            {showHistory ? "All Trips" : "Trip History"}
          </Text>
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
          filteredTrips.map((trip, index) => {
            // Use the index to access the corresponding trip history entry
            const completedAt = tripsHistory[index]?.completed_at;
            return (
              <TripRow
                key={`${trip._id}-${index}`}
                trip={trip}
                completedAt={completedAt} // Pass the completed_at field as a prop
                onPress={() =>
                  navigation.navigate("TripsStack", {
                    screen: "TripPage",
                    params: { tripId: trip._id },
                  })
                }
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripsPage;
