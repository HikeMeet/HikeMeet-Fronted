import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { Group } from "../../../interfaces/group-interface";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import JoinGroupActionButton from "./group-join-action-button";
import LtrText from "../../../components/ltr-text";

interface GroupRowProps {
  group: Group;
  navigation: any;
  onAction?: () => void;
  onPress: () => void;
  showAvailability?: boolean;
  showAdminBadge?: boolean;
  currentUserId?: string;
}

const GroupRow: React.FC<GroupRowProps> = ({
  group,
  navigation,
  onAction,
  onPress,
  showAvailability = false,
  showAdminBadge = false,
  currentUserId,
}) => {
  const currentMembers = group.members ? group.members.length : 0;
  const spotsLeft = group.max_members - currentMembers;
  const isFull = spotsLeft <= 0;

  const isAdmin =
    showAdminBadge && currentUserId && group.created_by === currentUserId;

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
              <LtrText
                className="text-lg font-bold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {group.name}
              </LtrText>
              <Text className="text-sm text-gray-500">
                Status: {group.status}
              </Text>
            </View>

            {/* Right side: actions + availability */}
            <View className="items-end ml-2">
              <JoinGroupActionButton
                group={group}
                navigation={navigation}
                isInGroupPage={false}
                onAction={onAction}
              />

              {/* Member count + availability */}
              <View className="items-end mt-1">
                <View className="flex-row items-center">
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
                </View>

                {isAdmin ? (
                  <Text
                    className="text-xs font-bold mt-1"
                    style={{ color: "#000000" }}
                  >
                    • in group
                  </Text>
                ) : (
                  showAvailability && (
                    <Text
                      className={`text-xs font-semibold ${
                        isFull ? "text-red-600" : "text-black-600"
                      }`}
                    >
                      {isFull ? "• Full" : `• ${spotsLeft} left`}
                    </Text>
                  )
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
