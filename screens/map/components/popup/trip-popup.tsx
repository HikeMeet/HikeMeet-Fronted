import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { Trip } from "../../../../interfaces/trip-interface";
import { Group } from "../../../../interfaces/group-interface";
import TripRow from "../../../trips/component/trip-row";
import GroupRow from "../../../groups/components/group-row";

type TripPopupProps = {
  trip: Trip;
  onClose: () => void;
  onGroupPress: (groupId: string, action: "join" | "details") => void;
  onAddGroup: () => void;
  navigation: any;
};

export default function TripPopup({
  trip,
  onClose,
  onGroupPress,
  onAddGroup,
  navigation,
}: TripPopupProps) {
  const groups = trip.groups || [];

  return (
    <View className="bg-white/90 rounded-t-[32px] shadow-2xl max-h-[100%] px-6 pt-5 pb-4 border-t border-gray-100">
      {/* Close button (X) */}
      <TouchableOpacity
        onPress={onClose}
        className="absolute top-4 right-4 z-50"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="close" size={22} color="#555" />
      </TouchableOpacity>

      {/* Small drag bar (optional) */}
      <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-3" />

      {/* Trip information (TripRow) */}
      <View className="relative mb-4">
        <TripRow
          trip={trip}
          fromMap
          // You can reduce an image through a special prop or through design in TripRow
          onPress={() =>
            navigation.navigate("TripsStack", {
              screen: "TripPage",
              params: { tripId: trip._id },
            })
          }
        />

        {/* button Add Group */}
        <TouchableOpacity
          onPress={onAddGroup}
          className="absolute right-1 top-5 mt-0 bg-emerald-600 px-4 py-2 rounded-xl shadow-sm"
        >
          <Text className="text-white text-xs font-semibold">+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* title– Available Groups */}
      <Text className="text-base font-medium text-gray-700 mb-2">
        Available Groups
      </Text>

      {/* list groups*/}
      <ScrollView className="max-h-48" showsVerticalScrollIndicator={false}>
        {groups.length === 0 ? (
          <Text className="text-gray-400 italic mt-2">No groups yet.</Text>
        ) : (
          groups.map((group: Group) => (
            <GroupRow
              key={group._id}
              group={group}
              navigation={navigation}
              showAvailability
              onAction={() => onGroupPress(group._id, "join")}
              onPress={() =>
                navigation.navigate("GroupsStack", {
                  screen: "GroupPage",
                  params: { groupId: group._id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
