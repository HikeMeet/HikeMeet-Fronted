import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { Group } from "../interfaces/group-interface";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import JoinGroupActionButton from "./group-join-action-button";

interface GroupRowProps {
  group: Group;
  navigation: any;
  onAction?: () => void;
  showAvailability?: boolean; // אופציונלי
}

const GroupRow: React.FC<GroupRowProps> = ({
  group,
  navigation,
  onAction,
  showAvailability = false,
}) => {
  const currentMembers = group.members ? group.members.length : 0;
  const spotsLeft = group.max_members - currentMembers;
  const isFull = spotsLeft <= 0;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("GroupsStack", {
          screen: "GroupPage",
          params: { groupId: group._id },
        })
      }
      className="flex-row items-center bg-gray-100 mb-4 p-4 rounded-lg"
    >
      {group.main_image ? (
        <Image
          source={{ uri: group.main_image.url }}
          className="w-16 h-16 mr-4 rounded"
        />
      ) : (
        <View className="w-16 h-16 bg-gray-300 mr-4 rounded" />
      )}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-lg font-bold flex-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {group.name}
          </Text>
          <View className="flex-col items-end">
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-500">
                {currentMembers}/{group.max_members}
              </Text>
              {group.privacy === "private" && (
                <Icon
                  name="lock"
                  size={16}
                  color="#555"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
            <JoinGroupActionButton
              group={group}
              navigation={navigation}
              isInGroupPage={false}
              onAction={onAction}
            />

            {/* how much place in group left*/}
            {showAvailability && (
              <Text
                className={`text-s font-semibold mt-1 ${
                  isFull ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {isFull ? "• Full" : `• ${spotsLeft} left`}
              </Text>
            )}
          </View>
        </View>
        <Text className="text-sm text-gray-500">Status: {group.status}</Text>
        <Text className="text-sm text-gray-500">Privacy: {group.privacy}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default GroupRow;
