import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import tw from "twrnc";
import FriendActionButton from "./friend-button";

interface UserRowProps {
  user: any;
  currentUserId: string;
  onStatusChange: (newStatus: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  currentUserId,
  onStatusChange,
}) => {
  return (
    <View
      style={tw`mb-2 p-4 bg-gray-100 rounded-lg flex-row items-center shadow-sm`}
    >
      <Image
        source={{
          uri: user.profile_picture || "https://via.placeholder.com/50",
        }}
        style={tw`w-10 h-10 rounded-full mr-4`}
      />
      <View style={tw`flex-1`}>
        <Text style={tw`text-lg font-bold`}>{user.username}</Text>
        <Text
          style={tw`text-sm text-gray-500`}
        >{`${user.first_name} ${user.last_name}`}</Text>
      </View>
      {user._id !== currentUserId && currentUserId && (
        <FriendActionButton
          currentUserId={currentUserId}
          targetUserId={user._id}
          status={user.friendStatus || "none"}
          onStatusChange={(newStatus: string) => onStatusChange(newStatus)}
        />
      )}
    </View>
  );
};

export default UserRow;
