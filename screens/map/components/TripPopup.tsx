import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Trip } from "../map-page";

type TripPopupProps = {
  trip: Trip;
  onClose: () => void;
  onGroupPress: (groupId: string) => void;
  onAddGroup: () => void;
};

export default function TripPopup({
  trip,
  onClose,
  onGroupPress,
  onAddGroup,
}: TripPopupProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white p-5 rounded-t-3xl shadow-xl max-h-[50%] border-t-[1px] border-gray-200">
      <View className="mb-4">
        <Text className="text-2xl font-extrabold text-gray-900">
          {trip.name}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Join one of the available groups
        </Text>
      </View>

      <ScrollView className="max-h-40 mb-4">
        {!trip.groups || trip.groups.length === 0 ? (
          <Text className="text-gray-400 text-center italic">
            No groups available for this trip.
          </Text>
        ) : (
          trip.groups.map((group) => {
            const spotsLeft = group.max_members - group.membersCount;
            const isFull = spotsLeft <= 0;

            return (
              <TouchableOpacity
                key={group._id}
                onPress={() => onGroupPress(group._id)}
                className={`mb-3 p-4 rounded-xl ${
                  isFull ? "bg-gray-100" : "bg-blue-50"
                } border border-gray-200`}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-lg font-semibold text-gray-800">
                    {group.name}
                  </Text>
                  <Text
                    className={`text-xs font-medium ${isFull ? "text-red-500" : "text-green-600"}`}
                  >
                    {isFull ? "Full" : `${spotsLeft} Spots Left`}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 mb-1">
                  Leader: {group.leaderName}
                </Text>
                <Text className="text-sm text-gray-700">
                  {group.membersCount} / {group.max_members} Joined
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          onPress={onAddGroup}
          className="bg-blue-600 px-5 py-2 rounded-full shadow-sm"
        >
          <Text className="text-white font-semibold text-sm">+ Add Group</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClose}
          className="px-4 py-2 rounded-full border border-gray-300"
        >
          <Text className="text-gray-700 text-sm">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
