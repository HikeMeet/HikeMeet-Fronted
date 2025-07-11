// TripsPage.tsx

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
import {
  fetchTrips,
  fetchTripsByIds,
} from "../../components/requests/fetch-trips";
import { useChatList } from "../../contexts/chat-context";
import { useFocusEffect } from "@react-navigation/native";
import TripFilterModal from "../../components/trip-filter-modal";

type ViewMode = "all" | "history" | "favorites";

const TripsPage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsHistory, setTripsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [tripsToShow, setTripsToShow] = useState<number>(5);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const { mongoUser, fetchMongoUser, mongoId } = useAuth();
  const { initializeRooms } = useChatList();

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tripFilters, setTripFilters] = useState<
    { id: string; label: string }[]
  >([]);
  const [initialTripFilterState, setInitialTripFilterState] = useState<{
    location: string;
    tags: string[];
  }>({
    location: "",
    tags: [],
  });

  // 1) Fetch all trips
  const handleFetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetchTrips();
      setTrips(response);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1) Fetch trip history
  const fetchTripHistory = async () => {
    setLoading(true);
    try {
      const historyEntries = mongoUser!.trip_history;
      const tripIds = historyEntries.map((e) => e.trip);

      // save raw history objects for completedAt lookup
      setTripsHistory(historyEntries);

      if (tripIds.length === 0) {
        // no history → empty list
        setTrips([]);
        return;
      }

      // fetch the Trip[] by IDs
      const data = await fetchTripsByIds(tripIds);
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trip history:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2) Fetch favorite trips
  const fetchFavoriteTrips = async () => {
    setLoading(true);
    try {
      const favIds = mongoUser!.favorite_trips;

      if (!favIds || favIds.length === 0) {
        setTrips([]);
        return;
      }

      const data = await fetchTripsByIds(favIds);
      setTrips(data);
    } catch (error) {
      console.error("Error fetching favorite trips:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // fetchMongoUser(mongoId!);
      // initializeRooms();
      setTripsToShow(5);
      if (viewMode === "all") {
        handleFetchTrips();
      } else if (viewMode === "history") {
        fetchTripHistory();
      } /* favorites */ else {
        fetchFavoriteTrips();
      }
    }, [viewMode])
  );

  // 4) Prepare the array to display
  let workingTrips = trips;
  if (viewMode === "favorites") {
    const favSet = new Set(mongoUser!.favorite_trips);
    workingTrips = workingTrips.filter((t) => favSet.has(t._id));
  }
  let filteredTrips = [...workingTrips];

  // חיפוש לפי טקסט חופשי
  filteredTrips = filteredTrips.filter((t) =>
    t.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // חיפוש לפי פילטרים
  const tags = tripFilters
    .filter((f) => f.id.startsWith("tripTag="))
    .map((f) => f.id.split("=")[1]);

  const location = tripFilters
    .find((f) => f.id.startsWith("tripLocation="))
    ?.id.split("=")[1];

  if (location) {
    filteredTrips = filteredTrips.filter((t) =>
      t.location.address?.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (tags.length > 0) {
    filteredTrips = filteredTrips.filter((t) =>
      t.tags?.some((tag) => tags.includes(tag))
    );
  }
  const displayedTrips = filteredTrips.slice(0, tripsToShow);

  // 5) Pagination
  const handleLoadMore = useCallback(() => {
    if (tripsToShow < filteredTrips.length) {
      setTripsToShow((prev) => prev + 5);
    }
  }, [tripsToShow, filteredTrips.length]);

  // 6) Pull-to-refresh handler
  const onRefresh = () => {
    if (viewMode === "all") handleFetchTrips();
    else if (viewMode === "history") fetchTripHistory();
    else handleFetchTrips();
  };

  const renderListHeader = () => (
    <>
      {/* Search bar */}
      <View className="flex-row items-center mb-4">
        <View className="flex-1 mr-2 bg-gray-100 rounded-full px-3 py-2">
          <TextInput
            placeholder="Search trip"
            className="text-base"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        {/* Add Trip button */}
        <View className="flex-row">
          {/* Filter Button - now appears first (left side) */}
          <TouchableOpacity
            onPress={() => {
              setShowFilterModal(true);
              const location =
                tripFilters
                  .find((f) => f.id.startsWith("tripLocation="))
                  ?.id.split("=")[1] || "";
              const tags = tripFilters
                .filter((f) => f.id.startsWith("tripTag="))
                .map((f) => f.id.split("=")[1]);
              setInitialTripFilterState({ location, tags });
            }}
            className="bg-gray-200 mr-2 px-4 py-2 rounded"
          >
            <Text className="text-sm text-gray-800">Filter</Text>
          </TouchableOpacity>

          {/* Add Trip Button - now appears second (right side) */}
          <TouchableOpacity
            onPress={() => navigation.navigate("TripsStack")}
            className="bg-green-500 px-4 py-2 rounded"
          >
            <Text className="text-white font-semibold">+ Add trip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tripFilters.length > 0 && (
        <View className="flex-row items-center mb-2 mt-1flex-wrap">
          {tripFilters.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                const newFilters = tripFilters.filter((f) => f.id !== item.id);
                setTripFilters(newFilters);
              }}
              className="bg-gray-200 px-5 py-2.5 rounded-full mr-2 mb-2"
            >
              <Text className="text-gray-700 text-xs">{item.label} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tabs */}
      <View className="flex-row mb-4">
        {[
          { label: "All", mode: "all" as ViewMode },
          { label: "History", mode: "history" as ViewMode },
          { label: "Favorites", mode: "favorites" as ViewMode },
        ].map(({ label, mode }) => {
          const active = viewMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              onPress={() => setViewMode(mode)}
              className={`flex-1 px-4 py-2 border-b-2 ${
                active ? "border-blue-500 bg-blue-50" : "border-transparent"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  active ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  {
    tripFilters.length > 0 && (
      <View className="flex-row items-center mb-2 flex-wrap">
        {tripFilters.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              const newFilters = tripFilters.filter((f) => f.id !== item.id);
              setTripFilters(newFilters);
            }}
            className="bg-gray-200 px-5 py-2.5 rounded-full mr-2 mb-2"
          >
            <Text className="text-gray-700 text-xs">{item.label} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {loading && trips.length === 0 ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {renderListHeader()}
          <FlatList
            data={displayedTrips}
            keyExtractor={(item, idx) => `${item._id}-${idx}`}
            renderItem={({ item, index }) => {
              // only history mode had a completed_at
              const completedAt =
                viewMode === "history"
                  ? tripsHistory[index]?.completed_at
                  : undefined;
              return (
                <TripRow
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
            ListEmptyComponent={() =>
              !loading ? (
                <View className="mt-10">
                  <Text className="text-lg text-center">No trips found.</Text>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <TripFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        trips={trips}
        onApply={(filtered, chosen) => {
          setTripFilters(chosen);
          setShowFilterModal(false);
        }}
        initialFilters={initialTripFilterState}
      />
    </SafeAreaView>
  );
};

export default TripsPage;
