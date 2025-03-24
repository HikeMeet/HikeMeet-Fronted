import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Group } from "../interfaces/group-interface";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import JoinGroupActionButton from "./group-join-action-button";

interface GroupRowProps {
  group: Group;
  navigation: any;
}

const GroupRow: React.FC<GroupRowProps> = ({ group, navigation }) => {
  const currentMembers = group.members ? group.members.length : 0;

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
            />
          </View>
        </View>
        <Text className="text-sm text-gray-500">Status: {group.status}</Text>
        <Text className="text-sm text-gray-500">Privacy: {group.privacy}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default GroupRow;
