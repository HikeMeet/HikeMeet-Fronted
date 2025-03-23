import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import { MongoUser } from "../interfaces/user-interface";
import { Group } from "../interfaces/group-interface";
import { useAuth } from "../contexts/auth-context";

interface InviteUserRowProps {
  friend: MongoUser;
  group: Group;
}

const InviteUserRow: React.FC<InviteUserRowProps> = ({ friend, group }) => {
  const { mongoId } = useAuth();
  const [invited, setInvited] = useState(false);

  const handleInvite = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${group._id}/invite/${friend._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_triggered: mongoId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to invite friend");
        return;
      }
      Alert.alert("Success", "Invitation sent!");
      setInvited(true);
    } catch (error) {
      console.error("Error inviting friend:", error);
      Alert.alert("Error", "Failed to invite friend");
    }
  };

  return (
    <View
      style={tw`flex-row items-center justify-between mb-4 p-2 border border-gray-200 rounded`}
    >
      <View style={tw`flex-1`}>
        <Text style={tw`font-bold`}>{friend.username}</Text>
        <Text style={tw`text-sm text-gray-500`}>
          {friend.first_name} {friend.last_name}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleInvite}
        disabled={invited}
        style={tw`bg-blue-500 px-3 py-2 rounded`}
      >
        <Text style={tw`text-white text-sm`}>
          {invited ? "Invited" : "Invite"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default InviteUserRow;
