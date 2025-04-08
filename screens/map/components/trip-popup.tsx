import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { Trip } from "../../../interfaces/trip-interface";
import { Group } from "../../../interfaces/group-interface";
import GroupRow from "../../../components/group-row";
import TripRow from "../../../components/trip-row";

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
    <View className="bg-white rounded-t-3xl shadow-2xl max-h-[70%] px-5 pt-4 pb-6 border-t border-gray-200">
      {/* כפתור סגירה (X) */}
      <TouchableOpacity
        onPress={onClose}
        className="absolute top-4 right-4 z-50"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="close" size={22} color="#555" />
      </TouchableOpacity>

      {/* פס גרירה קטן (אופציונלי) */}
      <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-3" />

      {/* מידע הטיול (TripRow) */}
      <View className="relative mb-4">
        <TripRow
          trip={trip}
          fromMap
          // ניתן להקטין תמונה דרך פרופ מיוחד או דרך עיצוב ב-TripRow
          onPress={() =>
            navigation.navigate("TripsStack", {
              screen: "TripPage",
              params: { tripId: trip._id },
            })
          }
        />

        {/* כפתור Add Group */}
        <TouchableOpacity
          onPress={onAddGroup}
          className="absolute right-1 top-5 mt-3 bg-emerald-600 px-4 py-2 rounded-xl shadow-sm"
        >
          <Text className="text-white text-xs font-semibold">+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* כותרת – Available Groups */}
      <Text className="text-base font-medium text-gray-700 mb-2">
        Available Groups
      </Text>

      {/* רשימת הקבוצות */}
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
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
