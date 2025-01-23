import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BioSection from "../../components/profile-bio-section";
import { useAuth } from "../../contexts/auth-context";
import FriendButton from "../../components/friend-button"; // Import the FriendButton component

const UserProfile = ({ route, navigation }: any) => {
  const { userId } = route.params; // ID of the user to fetch
  const [user, setUser] = useState<any>(null); // User data
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "friend">("none"); // Friend status
  const [loading, setLoading] = useState(true); // Loading state
  const { mongoId } = useAuth(); // Get the mongoId from useAuth

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // Fetch user details
        const response = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/user/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUser(data);

        // Check friend status
        const friendResponse = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/friends/status?userId=${mongoId}&friendId=${userId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!friendResponse.ok) {
          throw new Error("Failed to check friend status");
        }
        const friendData = await friendResponse.json();
        setFriendStatus(friendData.status || "none");
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Ionicons name="notifications" size={24} color="black" />
      </View>

      <ScrollView className="p-4">
        {/* User Details */}
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: user.profile_picture || "https://via.placeholder.com/150" }}
            className="w-24 h-24 rounded-full mr-4"
          />
          <View>
            <Text className="text-xl font-bold">{`${user.first_name} ${user.last_name}`}</Text>
            <Text className="text-sm text-gray-500">Rank: Adventurer</Text>
          </View>
        </View>

        {/* Friend Button */}
        {mongoId && (
          <FriendButton
            currentUserId={mongoId}
            targetUserId={userId}
            initialStatus={friendStatus}
            onStatusChange={(newStatus) => setFriendStatus(newStatus)} // Update the local state
          />
        )}

        {/* Bio Section */}
        <BioSection bio={user.bio} />

        {/* Divider */}
        <View className="h-px bg-gray-300 my-4" />

        {/* Example Posts */}
        <Text className="text-lg font-bold mb-2">Posts</Text>
        {[1, 2, 3].map((post, index) => (
          <View
            key={index}
            className="mb-4 p-4 bg-gray-100 rounded-lg shadow-sm"
          >
            <Text className="text-sm text-gray-800">Post {index + 1}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;
