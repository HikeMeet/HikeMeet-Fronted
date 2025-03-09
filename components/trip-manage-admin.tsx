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
import { Ionicons } from "@expo/vector-icons";

interface TripsManageProps {
  navigation: any;
}

const TripsManage: React.FC<TripsManageProps> = ({ navigation }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [archivedTrips, setArchivedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "archived">("all");
  // State to control the visibility of extra options (unarchive & delete) per archived trip
  const [visibleSettings, setVisibleSettings] = useState<
    Record<string, boolean>
  >({});

  // Fetch active trips
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

  // Fetch archived trips
  const fetchArchivedTrips = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/trips/archive/all`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch archived trips");
      }
      const data: Trip[] = await response.json();
      setArchivedTrips(data);
    } catch (error) {
      console.error("Error fetching archived trips:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "all") {
      fetchTrips();
    } else if (activeTab === "archived") {
      fetchArchivedTrips();
    }
  }, [activeTab]);

  // Filter trips based on search text for current tab
  const filteredTrips =
    activeTab === "all"
      ? trips.filter((trip) =>
          trip.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : archivedTrips.filter((trip) =>
          trip.name.toLowerCase().includes(searchText.toLowerCase())
        );

  // Handler for moving a trip to archive
  const handleArchive = async (tripId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/trips/archive/${tripId}`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error("Failed to archive trip");
      }
      const data = await response.json();
      console.log("Trip archived successfully:", data);

      // Remove trip from active trips list and add to archivedTrips list
      setTrips((prevTrips) => prevTrips.filter((trip) => trip._id !== tripId));
      setArchivedTrips((prev) => [data.archivedTrip, ...prev]);
    } catch (error) {
      console.error("Error archiving trip:", error);
    }
  };

  // Handler for deleting a trip from archive
  const handleDeleteArchived = async (tripId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/trips/archive/${tripId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete archived trip");
      }
      console.log("Archived trip deleted successfully");
      setArchivedTrips((prev) => prev.filter((trip) => trip._id !== tripId));
    } catch (error) {
      console.error("Error deleting archived trip:", error);
    }
  };

  // Handler for unarchiving a trip (move it back to active trips)
  const handleUnarchive = async (tripId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/trips/unarchive/${tripId}`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error("Failed to unarchive trip");
      }
      const data = await response.json();
      console.log("Trip unarchived successfully:", data);
      setArchivedTrips((prev) => prev.filter((trip) => trip._id !== tripId));
      setTrips((prev) => [data.trip, ...prev]);
    } catch (error) {
      console.error("Error unarchiving trip:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* Tabs for All Trips and Archived Trips */}
      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("all")}
          className={`flex-1 p-3 rounded ${
            activeTab === "all" ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`text-center text-sm ${
              activeTab === "all" ? "text-white" : "text-black"
            }`}
          >
            All Trips
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("archived")}
          className={`flex-1 p-3 rounded ml-2 ${
            activeTab === "archived" ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`text-center text-sm ${
              activeTab === "archived" ? "text-white" : "text-black"
            }`}
          >
            Archived Trips
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View className="bg-gray-100 rounded-lg p-4 flex-1">
        <View className="flex-row items-center mb-4">
          <View className="flex-1 mr-2 bg-gray-200 rounded-full px-3 py-2">
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
              <View
                key={trip._id}
                className="flex-row items-center bg-white mb-4 p-4 rounded-lg"
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("TripsStack", {
                      screen: "TripPage",
                      params: {
                        tripId: trip._id,
                        isArchived: activeTab === "archived",
                      },
                    })
                  }
                  className="flex-row flex-1 items-center"
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
                {activeTab === "all" ? (
                  <TouchableOpacity
                    onPress={() => handleArchive(trip._id)}
                    className="ml-4 p-2 bg-red-500 rounded"
                  >
                    <Text className="text-white">Archive</Text>
                  </TouchableOpacity>
                ) : (
                  // For archived trips, show a settings icon; tapping it toggles unarchive and delete buttons.
                  <View className="flex-row items-center">
                    {visibleSettings[trip._id] && (
                      <View className="flex-row mr-2">
                        <TouchableOpacity
                          onPress={() => handleUnarchive(trip._id)}
                          className="p-2 bg-green-500 rounded"
                        >
                          <Text className="text-white">Unarchive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteArchived(trip._id)}
                          className="ml-2 p-2 bg-red-500 rounded"
                        >
                          <Text className="text-white">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() =>
                        setVisibleSettings((prev) => ({
                          ...prev,
                          [trip._id]: !prev[trip._id],
                        }))
                      }
                    >
                      <Ionicons name="settings" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TripsManage;
