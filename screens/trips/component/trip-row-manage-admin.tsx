import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Trip } from "../../../interfaces/trip-interface";
import ConfirmationModal from "../../../components/confirmation-modal";

interface TripRowProps {
  trip: Trip;
  activeTab: "all" | "archived";
  onNavigate: (tripId: string, isArchived: boolean) => void;
  onArchive: (tripId: string) => void;
  onUnarchive: (tripId: string) => void;
  onDeleteArchived: (tripId: string) => void;
  visibleSettings: Record<string, boolean>;
  toggleSettings: (tripId: string) => void;
}

const TripRow: React.FC<TripRowProps> = ({
  trip,
  activeTab,
  onNavigate,
  onArchive,
  onUnarchive,
  onDeleteArchived,
  visibleSettings,
  toggleSettings,
}) => {
  // State to control which modal is visible: "archive", "unarchive", "delete", or null
  const [modalAction, setModalAction] = useState<
    "archive" | "unarchive" | "delete" | null
  >(null);

  const handleConfirmAction = () => {
    if (modalAction === "archive") {
      onArchive(trip._id);
    } else if (modalAction === "unarchive") {
      onUnarchive(trip._id);
    } else if (modalAction === "delete") {
      onDeleteArchived(trip._id);
    }
    setModalAction(null);
    toggleSettings(trip._id);
  };

  return (
    <View className="flex-row items-center bg-white mb-4 p-4 rounded-lg h-24">
      {/* Left side: Image and info/buttons wrapped in a TouchableOpacity */}
      <TouchableOpacity
        onPress={() => onNavigate(trip._id, activeTab === "archived")}
        className="flex-row flex-1 items-center"
      >
        {trip.main_image ? (
          <Image
            source={{ uri: trip.main_image?.url }}
            className="w-16 h-16 mr-4 rounded"
          />
        ) : (
          <View className="w-16 h-16 bg-gray-300 mr-4 rounded" />
        )}
        <View className="flex-1 justify-center">
          {visibleSettings[trip._id] ? (
            activeTab === "all" ? (
              // For active trips, show Archive button (replace text) and trigger archive confirmation
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setModalAction("archive")}
                  className="p-2 bg-red-500 rounded"
                >
                  <Text className="text-white text-center">Archive</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // For archived trips, show Unarchive and Delete buttons.
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setModalAction("unarchive")}
                  className="p-2 bg-green-500 rounded"
                >
                  <Text className="text-white">Unarchive</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalAction("delete")}
                  className="ml-2 p-2 bg-red-500 rounded"
                >
                  <Text className="text-white">Delete</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            // When not toggled, show the default trip name and location.
            <>
              <Text
                className="text-lg font-bold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {trip.name}
              </Text>
              <Text
                className="text-sm text-gray-500"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {trip.location.address}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Right side: Settings icon always visible */}
      <TouchableOpacity
        onPress={() => toggleSettings(trip._id)}
        className="ml-2"
      >
        <Ionicons name="settings" size={24} color="black" />
      </TouchableOpacity>

      {/* Confirmation Modal for Archive, Unarchive, and Delete actions */}
      <ConfirmationModal
        visible={modalAction !== null}
        message={
          modalAction === "archive"
            ? "Are you sure you want to archive this trip?"
            : modalAction === "unarchive"
              ? "Are you sure you want to unarchive this trip?"
              : "Are you sure you want to delete this trip?"
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setModalAction(null)}
      />
    </View>
  );
};

export default TripRow;
