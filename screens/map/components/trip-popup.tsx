import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Trip } from "../../../interfaces/trip-interface";
import GroupRow from "../../../components/group-row";
import Icon from "react-native-vector-icons/Ionicons";

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
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[70%] px-5 pt-4 pb-6 border-t border-gray-200">
      {/* ✘ כפתור סגירה קטן למעלה */}
      <TouchableOpacity
        onPress={onClose}
        className="absolute top-4 right-4 z-50"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="close" size={22} color="#555" />
      </TouchableOpacity>

      {/* כותרת עם ידית */}
      <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-4" />
      {/* מידע על הטיול עם כפתור בצד ימין */}
      <View className="flex-row items-start justify-between mb-4">
        {/* תמונה של הטיול */}
        {trip.main_image?.url && (
          <Image
            source={{ uri: trip.main_image.url }}
            className="w-14 h-14 rounded-xl mr-3"
            resizeMode="cover"
          />
        )}

        {/* שם הטיול + כתובת */}
        <View className="flex-1 mr-2">
          <Text
            className="text-xl font-semibold text-gray-900"
            numberOfLines={1}
          >
            {trip.name}
          </Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {trip.location?.address ?? "No address"}
          </Text>
        </View>

        {/* כפתור הוספת קבוצה */}
        <TouchableOpacity
          onPress={onAddGroup}
          className="bg-emerald-600 px-3 py-2 mt-7 rounded-xl shadow-sm"
        >
          <Text className="text-white text-xs font-semibold">+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* כותרת קבוצות */}
      <Text className="text-base font-medium text-gray-700 mb-2">
        Available Groups
      </Text>

      {/* רשימת קבוצות */}
      <ScrollView
        className="max-h-48 mb-22"
        showsVerticalScrollIndicator={false}
      >
        {!trip.groups || trip.groups.length === 0 ? (
          <Text className="text-gray-400 italic mt-2">No groups yet.</Text>
        ) : (
          trip.groups.map((group) => (
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
