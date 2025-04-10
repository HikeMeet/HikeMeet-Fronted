import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Trip } from "../../../interfaces/trip-interface";

interface TripSelectorProps {
  onSelectTrip: (tripId: string) => void;
  selectedTripId: string;
}

const truncateText = (text: string, maxLength: number = 30) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const TripSelector: React.FC<TripSelectorProps> = ({
  onSelectTrip,
  selectedTripId,
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedTripForModal, setSelectedTripForModal] = useState<Trip | null>(
    null
  );

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

  const filteredTrips = trips.filter(
    (trip) =>
      trip.name.toLowerCase().includes(searchText.toLowerCase()) ||
      trip.location.address.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleTripPress = (trip: Trip) => {
    // Single tap selects the trip.
    onSelectTrip(trip._id);
  };

  const handleTripLongPress = (trip: Trip) => {
    // Long press opens the modal.
    setSelectedTripForModal(trip);
    setDetailModalVisible(true);
  };

  // Helper to truncate location text to 30 characters.

  return (
    <View>
      <TextInput
        placeholder="Search trip by name or location"
        value={searchText}
        onChangeText={setSearchText}
        className="bg-gray-100 p-3 rounded mb-4"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : filteredTrips.length === 0 ? (
        <Text>No trips found.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredTrips.map((trip) => (
            <TouchableOpacity
              key={trip._id}
              onPress={() => handleTripPress(trip)}
              onLongPress={() => handleTripLongPress(trip)}
              className={`p-4 mr-4 border rounded ${
                selectedTripId === trip._id
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            >
              <View className="flex-row items-center">
                {trip.main_image ? (
                  <Image
                    source={{ uri: trip.main_image.url }}
                    className="w-16 h-16 rounded mr-4"
                  />
                ) : (
                  <View className="w-16 h-16 bg-gray-300 rounded mr-4" />
                )}
                <View>
                  <Text className="font-semibold">
                    {truncateText(trip.name, 15)}
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="text-xs text-gray-500"
                  >
                    {truncateText(trip.location.address)}
                  </Text>
                  {/* This label indicates long press for details */}
                  <Text className="text-xxs text-gray-400 mt-1">
                    Long press for details
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {/* Modal for Trip Details */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 bg-white rounded p-5">
            {selectedTripForModal && (
              <>
                <Text className="text-xl font-bold mb-2">
                  {selectedTripForModal.name}
                </Text>
                <Text className="text-sm text-gray-500 mb-2">
                  {selectedTripForModal.location.address}
                </Text>
                {selectedTripForModal.images &&
                selectedTripForModal.images.length > 0 ? (
                  <Image
                    source={{ uri: selectedTripForModal.main_image?.url }}
                    className="w-full h-40 rounded mb-2"
                  />
                ) : (
                  <View className="w-full h-40 bg-gray-300 rounded mb-2" />
                )}
                <Text className="text-base mb-2">
                  {selectedTripForModal.description ||
                    "No description available."}
                </Text>
                {selectedTripForModal.tags &&
                  selectedTripForModal.tags.length > 0 && (
                    <View className="flex-row flex-wrap justify-center mb-2">
                      {selectedTripForModal.tags.map((tag, index) => (
                        <Text
                          key={index}
                          className="bg-gray-200 text-xs text-gray-700 px-2 py-1 rounded m-1"
                        >
                          {tag}
                        </Text>
                      ))}
                    </View>
                  )}
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  className="bg-blue-500 px-4 py-2 rounded mt-2"
                >
                  <Text className="text-white font-bold text-center">
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TripSelector;
