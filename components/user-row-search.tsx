import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import FriendActionButton from "./friend-button";
import { useAuth } from "../contexts/auth-context";
import LtrText from "./ltr-text";

interface UserRowProps {
  isMyProfile?: boolean;
  user: any;
  onStatusChange: (newStatus: string) => void;
  navigation: any;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  onStatusChange,
  navigation,
}) => {
  const { mongoId, mongoUser } = useAuth();
  const handlePress = () => {
    if (user._id === mongoId) {
      navigation.push("Tabs", { screen: "Profile" });
    } else {
      navigation.push("AccountStack", {
        screen: "UserProfile",
        params: { userId: user._id },
      });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View className="mb-2 p-4 bg-gray-100 rounded-lg flex-row items-center shadow-sm">
        <Image
          source={{
            uri: user.profile_picture.url || "https://via.placeholder.com/50",
          }}
          className="w-10 h-10 rounded-full mr-4"
        />
        <View className="flex-1">
          <LtrText className="text-lg font-bold">{user.username}</LtrText>
          <LtrText className="text-sm text-gray-500">
            {user.first_name} {user.last_name}
          </LtrText>
        </View>
        {mongoId !== user._id && (
          <FriendActionButton
            targetUserId={user._id}
            status={
              mongoUser?.friends?.find((friend) => friend.id === user._id)
                ?.status || "none"
            }
            onStatusChange={onStatusChange}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default UserRow;
