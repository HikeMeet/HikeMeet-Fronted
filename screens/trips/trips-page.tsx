import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trip } from "../../interfaces/trip-interface";
import TripRow from "./component/trip-row";
import { useAuth } from "../../contexts/auth-context";
import { fetchTrips } from "../../components/requests/fetch-trips";

const TripsPage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsHistory, setTripsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  // New state: Only show 5 trips initially.
  const [tripsToShow, setTripsToShow] = useState<number>(5);
  const { mongoUser } = useAuth();

  const handleFetchTrips = async () => {
    try {
      const response = await fetchTrips();
      setTrips(response);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTrips();
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
      handleFetchTrips();
    }
    setShowHistory(!showHistory);
  };

  // Filter trips based on search text.
  const filteredTrips = trips.filter((trip) =>
    trip.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Data for FlatList: Only display a slice of the filtered trips.
  const displayedTrips = filteredTrips.slice(0, tripsToShow);

  // Load 5 more trips when end is reached.
  const handleLoadMore = useCallback(() => {
    if (tripsToShow < filteredTrips.length) {
      setTripsToShow((prev) => prev + 5);
    }
  }, [tripsToShow, filteredTrips.length]);

  // Render header for the FlatList (Search, Buttons).
  const renderListHeader = () => (
    <>
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
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {renderListHeader()}
          <FlatList
            data={displayedTrips}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            renderItem={({ item, index }) => {
              // Use the index to access the corresponding trip history entry.
              const completedAt = tripsHistory[index]?.completed_at;
              return (
                <TripRow
                  key={`${item._id}-${index}`}
                  trip={item}
                  completedAt={completedAt}
                  onPress={() =>
                    navigation.navigate("TripsStack", {
                      screen: "TripPage",
                      params: { tripId: item._id },
                    })
                  }
                />
              );
            }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={
              <View className="mt-10">
                <Text className="text-lg text-center">No trips found.</Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={handleFetchTrips}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default TripsPage;
