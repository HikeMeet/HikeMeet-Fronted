import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import tw from "twrnc";
import FriendActionButton from "./friend-button";
import { useAuth } from "../contexts/auth-context";

interface UserRowProps {
  user: any;
  currentUserId: string;
  onStatusChange: (newStatus: string) => void;
  navigation: any; // navigation prop to allow navigating to the UserProfile screen
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  currentUserId,
  onStatusChange,
  navigation,
}) => {
  const { mongoId } = useAuth(); // Current user's ID
  console.log(":::::", user.friendStatus, "\n:::::::", currentUserId);
  const handlePress = () => {
    if (user._id === mongoId) {
      // If the tapped row is the current user, navigate to the Profile tab
      navigation.navigate("Tabs", { screen: "Profile" });
    } else {
      // Otherwise navigate to the UserProfile screen
      navigation.navigate("UserProfile", { userId: user._id });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
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
        {/* Only render the FriendActionButton if this is not the current user */}
        {mongoId !== user._id && (
          <FriendActionButton
            currentUserId={currentUserId}
            targetUserId={user._id}
            status={user.friendStatus || "none"}
            onStatusChange={onStatusChange}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default UserRow;
