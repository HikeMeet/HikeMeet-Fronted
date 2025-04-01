import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Trip } from "../map-page";

type TripPopupProps = {
  trip: Trip;
  onClose: () => void;
  onGroupPress: (groupId: string, action: "join" | "details") => void;
  onAddGroup: () => void;
};

export default function TripPopup({
  trip,
  onClose,
  onGroupPress,
  onAddGroup,
}: TripPopupProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[60%] px-5 pt-4 pb-6 border-t border-gray-200">
      {/* Handle בראש */}
      <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-4" />

      {/* כותרת עם תמונה */}
      <View className="flex-row items-center mb-4">
        {trip.main_image?.url && (
          <Image
            source={{ uri: trip.main_image.url }}
            className="w-14 h-14 rounded-xl mr-4"
            resizeMode="cover"
          />
        )}
        <View className="flex-1">
          <Text className="text-xl font-semibold text-gray-900">
            {trip.name}
          </Text>
          <Text className="text-sm text-gray-500">
            {trip.location?.address ?? "No address"}
          </Text>
        </View>
      </View>

      {/* רשימת קבוצות */}
      <Text className="text-base font-medium text-gray-700 mb-2">
        Available Groups
      </Text>

      <ScrollView
        className="max-h-48 mb-4"
        showsVerticalScrollIndicator={false}
      >
        {!trip.groups || trip.groups.length === 0 ? (
          <Text className="text-gray-400 italic mt-2">No groups yet.</Text>
        ) : (
          trip.groups.map((group) => {
            const spotsLeft = group.max_members - group.membersCount;
            const isFull = spotsLeft <= 0;

            return (
              <View
                key={group._id}
                className="mb-3 border border-gray-200 rounded-2xl p-4 bg-gray-50 shadow-sm"
              >
                <Text className="text-lg font-semibold text-gray-800">
                  {group.name}
                </Text>
                <Text className="text-sm text-gray-600 mb-1">
                  Leader: {group.leaderName}
                </Text>
                <Text className="text-sm text-gray-600 mb-2">
                  {group.membersCount}/{group.max_members} joined{" "}
                  {isFull ? (
                    <Text className="text-red-500 font-semibold">• Full</Text>
                  ) : (
                    <Text className="text-green-500 font-semibold">
                      • {spotsLeft} left
                    </Text>
                  )}
                </Text>

                <View className="flex-row space-x-2">
                  {!isFull && (
                    <TouchableOpacity
                      onPress={() => onGroupPress(group._id, "join")}
                      className="flex-1 bg-green-500 px-4 py-2 rounded-xl"
                    >
                      <Text className="text-center text-white font-semibold">
                        Join
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => onGroupPress(group._id, "details")}
                    className="flex-1 bg-blue-500 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-center text-white font-semibold">
                      Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* כפתור הוספה */}
      <TouchableOpacity
        onPress={onAddGroup}
        className="bg-purple-600 py-3 px-5 rounded-2xl mb-3"
      >
        <Text className="text-center text-white font-semibold text-base">
          + Create Group
        </Text>
      </TouchableOpacity>

      {/* כפתור סגירה */}
      <TouchableOpacity onPress={onClose} className="self-center mt-1">
        <Text className="text-gray-500 underline text-sm">Close</Text>
      </TouchableOpacity>
    </View>
  );
}
