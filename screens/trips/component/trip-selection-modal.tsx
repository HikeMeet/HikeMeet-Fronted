import { useState } from "react";
import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Trip } from "../../../interfaces/trip-interface";
import TripRow from "./trip-row";

interface TripSelectionModalProps {
  visible: boolean;
  trips: Trip[];
  onSelect: (trip: Trip) => void;
  onClose: () => void;
}

const TripSelectionModal: React.FC<TripSelectionModalProps> = ({
  visible,
  trips,
  onSelect,
  onClose,
}) => {
  const [searchText, setSearchText] = useState("");

  // Filter trips based on search text.
  const filteredTrips = trips.filter((trip) =>
    trip.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-white p-4">
        <Text className="text-xl font-bold mb-4">Select a Trip</Text>
        <TextInput
          placeholder="Search trips..."
          value={searchText}
          onChangeText={setSearchText}
          className="border border-gray-300 rounded p-2 mb-4"
        />
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              activeOpacity={0.8}
              className="mb-2"
            >
              <TripRow trip={item} onPress={() => onSelect(item)} />
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          onPress={onClose}
          className="mt-4 p-3 bg-gray-300 rounded items-center"
        >
          <Text className="text-gray-700">Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default TripSelectionModal;
