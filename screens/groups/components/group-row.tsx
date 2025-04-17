import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { Group } from "../../../interfaces/group-interface";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import JoinGroupActionButton from "../../../components/group-join-action-button";

interface GroupRowProps {
  group: Group;
  navigation: any;
  onAction?: () => void;
  onPress: () => void;
  showAvailability?: boolean;
}

const GroupRow: React.FC<GroupRowProps> = ({
  group,
  navigation,
  onAction,
  onPress,
  showAvailability = false,
}) => {
  const currentMembers = group.members ? group.members.length : 0;
  const spotsLeft = group.max_members - currentMembers;
  const isFull = spotsLeft <= 0;

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-start bg-gray-100 mb-4 p-4 rounded-lg"
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
          <View className="flex-row justify-between items-start">
            {/* Left container with group name and status stacked vertically */}
            <View className="flex-col flex-1">
              <Text
                className="text-lg font-bold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {group.name}
              </Text>
              <Text className="text-sm text-gray-500">
                Status: {group.status}
              </Text>
            </View>
            {/* Right container with join button and lock icon + membership count */}
            <View className="flex-col items-end">
              {/* Wrap JoinGroupActionButton to ensure it is aligned at the top */}
              <View className="self-start">
                <JoinGroupActionButton
                  group={group}
                  navigation={navigation}
                  isInGroupPage={false}
                  onAction={onAction}
                />
              </View>
              <View className="flex-row items-center mt-1">
                {group.privacy === "private" && (
                  <Icon
                    name="lock"
                    size={16}
                    color="#555"
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text className="text-sm text-gray-500">
                  {currentMembers}/{group.max_members}
                </Text>
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
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default GroupRow;
