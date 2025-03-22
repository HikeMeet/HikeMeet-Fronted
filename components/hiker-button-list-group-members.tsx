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
import UserRow from "./user-row-search"; // adjust path if needed
import { GroupMember } from "../interfaces/group-interface";

// Each member has a user ID, role, and joined_at

interface HikersButtonProps {
  members: GroupMember[];
  navigation: any;
}

const HikersButton: React.FC<HikersButtonProps> = ({ members, navigation }) => {
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mergedUsers, setMergedUsers] = useState<any[]>([]);

  // Fetch full user data for all member IDs
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const ids = members.map((member) => member.user).join(",");
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/list-by-ids?ids=${ids}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const usersData = await response.json(); // Expect an array of user objects
      // Merge each fetched user with its corresponding role and joined_at from the members array
      const merged = usersData.map((user: any) => {
        const memberInfo = members.find((member) => member.user === user._id);
        return {
          ...user,
          role: memberInfo?.role,
          joined_at: memberInfo?.joined_at,
        };
      });
      setMergedUsers(merged);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to load hikers");
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    // On first press, if we haven't loaded the users yet, fetch them
    if (!showList && mergedUsers.length === 0) {
      fetchUsers();
    }
    setShowList(!showList);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        style={tw`bg-green-500 px-4 py-2 rounded self-start mt-4`}
      >
        <Text style={tw`text-white text-sm font-semibold`}>
          Hikers ({members.length})
        </Text>
      </TouchableOpacity>
      {showList && (
        <View style={tw`mt-4`}>
          {loading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : (
            <ScrollView>
              {mergedUsers.map((user, index) => (
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

export default HikersButton;
