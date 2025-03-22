import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import tw from "twrnc";
import UserRow from "./user-row-search"; // adjust path as needed
import { GroupPending } from "../interfaces/group-interface";

interface PendingButtonProps {
  pending: GroupPending[];
  navigation: any;
}

const PendingButton: React.FC<PendingButtonProps> = ({
  pending,
  navigation,
}) => {
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      // Build a comma-separated list of user IDs from pending members
      const ids = pending.map((p) => p.user).join(",");
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/list-by-ids?ids=${ids}`
      );
      if (!response.ok) throw new Error("Failed to fetch pending users");
      const usersData = await response.json(); // expecting an array of user objects

      // Merge each fetched user with the corresponding pending info (origin, status, created_at)
      const merged = usersData.map((user: any) => {
        const pendingInfo = pending.find((p) => p.user === user._id);
        return {
          ...user,
          origin: pendingInfo?.origin,
          status: pendingInfo?.status,
          created_at: pendingInfo?.created_at,
        };
      });
      setUsers(merged);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      Alert.alert("Error", "Failed to load pending invites");
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (pending.length === 0) {
      Alert.alert("Info", "No pending invites found");
      return;
    }
    if (!showList && users.length === 0) {
      fetchPendingUsers();
    }
    setShowList(!showList);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        style={tw`bg-yellow-500 px-4 py-2 rounded self-start mt-4`}
      >
        <Text style={tw`text-white text-sm font-semibold`}>
          Pending Invites/Requests ({pending.length})
        </Text>
      </TouchableOpacity>
      {showList && (
        <View style={tw`mt-4`}>
          {loading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : users.length === 0 ? (
            <Text style={tw`text-gray-800 text-sm`}>
              No pending invites found.
            </Text>
          ) : (
            <ScrollView>
              {users.map((user, index) => (
                <UserRow
                  key={user._id || index}
                  user={user}
                  onStatusChange={(newStatus: string) => console.log(newStatus)}
                  navigation={navigation}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

export default PendingButton;
