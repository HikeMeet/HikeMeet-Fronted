import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { Trip } from "../../../../interfaces/trip-interface";
import { Group } from "../../../../interfaces/group-interface";
import TripRow from "../../../trips/component/trip-row";
import GroupRow from "../../../groups/components/group-row";
import { useAuth } from "../../../../contexts/auth-context";

// New imports for drag-to-dismiss
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

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
  const { mongoId } = useAuth();

  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={animatedStyle}
        className="bg-white/90 rounded-t-[39px] shadow-2xl max-h-[100%] px-6 pt-5 pb-4 border border-gray-500 border-b-0"
      >
        {/* Close button (X) */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-4 right-4 z-50"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={22} color="#555" />
        </TouchableOpacity>

        {/* Small drag bar */}
        <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-3" />

        {/* Trip information (TripRow) */}
        <View className="relative mb-4">
          <TripRow
            trip={trip}
            fromMap
            ismap
            // You can reduce an image through a special prop or through design in TripRow
            onPress={() =>
              navigation.navigate("TripsStack", {
                screen: "TripPage",
                params: { tripId: trip._id },
              })
            }
          />
        </View>

        {/* title Available Groups עם כפתור Add Group באותה שורה */}
        <View className="flex-row items-center mb-2">
          <Text className="text-base font-medium text-gray-700">
            Available Groups
          </Text>
          <TouchableOpacity
            onPress={onAddGroup}
            activeOpacity={0.2}
            className="flex-row items-center bg-gray-200 px-2 py-1 ml-1 rounded-full shadow-sm border border-black"
          >
            <Text className="text-black text-sm font-semibold">+ Add</Text>
          </TouchableOpacity>
        </View>

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
                showAdminBadge={true}
                currentUserId={mongoId || undefined}
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
      </Animated.View>
    </PanGestureHandler>
  );
}
