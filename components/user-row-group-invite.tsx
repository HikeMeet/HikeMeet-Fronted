import React from "react";
import { View, Text, Image } from "react-native";
import { MongoUser } from "../interfaces/user-interface";
import { Group } from "../interfaces/group-interface";
import GroupActionButton from "./group-membership-action-button";
import { useAuth } from "../contexts/auth-context";

interface InviteUserRowProps {
  friend: MongoUser;
  group: Group;
  navigation: any;
}

const InviteUserRow: React.FC<InviteUserRowProps> = ({
  navigation,
  friend,

  group,
}) => {
  const { mongoId } = useAuth(); // current user's mongoId
  console.log("::::friend ", friend);
  return (
    <View className="flex-row items-center justify-between mb-4 p-2 border border-gray-200 rounded">
      <Image
        source={{
          uri: friend.profile_picture.url || "https://via.placeholder.com/50",
        }}
        className="w-10 h-10 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="font-bold">{friend.username}</Text>
        <Text className="text-sm text-gray-500">
          {friend.first_name} {friend.last_name}
        </Text>
      </View>
      {mongoId !== friend._id && (
        <GroupActionButton friend={friend} group={group} />
      )}
    </View>
  );
};

export default InviteUserRow;
