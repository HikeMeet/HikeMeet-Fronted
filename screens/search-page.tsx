import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/auth-context"; // Assuming you have an Auth Context to get the current user ID
import FriendButton from "../components/friend-button"; // Import the reusable FriendButton
import { useFocusEffect } from "@react-navigation/native";

const SearchPage = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]); // List of users from search results
  const [loading, setLoading] = useState(false); // Loading state
  const [filter, setFilter] = useState("All"); // Filter for different categories (e.g., Groups, Trips, etc.)
  const { mongoId } = useAuth(); // Current logged-in user's MongoDB ID

  // Fetch the friend status for each user
  const fetchFriendStatuses = async (userList: any[]) => {
    const updatedUsers = await Promise.all(
      userList.map(async (user) => {
        try {
          const response = await fetch(
            `${process.env.EXPO_LOCAL_SERVER}/api/friends/status?userId=${mongoId}&friendId=${user._id}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );
          if (response.ok) {
            const data = await response.json();
            return { ...user, friendStatus: data.status || "none" };
          }
        } catch (error) {
          console.error(`Error fetching friend status for user ${user._id}:`, error);
        }
        return { ...user, friendStatus: "none" }; // Default to "none" on failure
      })
    );
    setUsers(updatedUsers);
  };

  // Function to search for friends based on the query
  const searchFriends = async (query: string): Promise<any[]> => {
    if (!query.trim()) {
      setUsers([]); // Clear results if query is empty
      return [];
    }

    setLoading(true); // Start loading
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/search/friends?query=${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to fetch search results");
      }

      const data = await response.json();
      const userList = data.friends || [];
      fetchFriendStatuses(userList); // Fetch friend statuses for each user
      return userList;
    } catch (error) {
      console.error("Error fetching search results:", error);
      setUsers([]); // Clear results on error
      return [];
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-300">
        <Text className="text-lg font-bold">Search</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View className="px-4 pt-4 pb-1 py-3">
        <View className="flex-row items-center bg-gray-200 rounded-full px-4 py-1">
          <Ionicons name="search" size={20} color="gray" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search Everything..."
            onChangeText={searchFriends}
            autoFocus={true}
            className="flex-1 text-gray-700"
          />
        </View>
      </View>

      {/* Filters */}
      <View className="px-10">
        <ScrollView
          horizontal
          className="flex-row"
          contentContainerStyle={{
            alignItems: "center",
          }}
          showsHorizontalScrollIndicator={false}
        >
          {["All", "Groups", "Trip", "Hikes", "Posts"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              className={`px-3 py-2 rounded-full mx-1 mt-1 ${
                filter === item ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === item ? "text-white" : "text-gray-800"
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-gray-500">Loading...</Text>
        </View>
      ) : users.length > 0 ? (
        <ScrollView className="flex-1 px-4 mt-2">
          {users.map((user: any, index: number) => (
            <TouchableOpacity
              key={user._id || index}
              onPress={() =>
                user._id === mongoId
                  ? navigation.navigate("ProfilePage") // Navigate to the logged-in user's profile
                  : navigation.navigate("UserProfile", { userId: user._id }) // Navigate to the selected user's profile
              }
            >
              <View className="mb-2 p-4 bg-gray-100 rounded-lg flex-row items-center shadow-sm">
                <Image
                  source={{
                    uri: user.profile_picture || "https://via.placeholder.com/50",
                  }}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <View className="flex-1">
                  <Text className="text-lg font-bold">{user.username}</Text>
                  <Text className="text-sm text-gray-500">
                    {`${user.first_name} ${user.last_name}`}
                  </Text>
                </View>

                {/* FriendButton Component */}
                {user._id !== mongoId && mongoId && (
                  <FriendButton
                    currentUserId={mongoId}
                    targetUserId={user._id}
                    initialStatus={user.friendStatus || "none"}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center mt-2">
          <Text className="text-gray-500">
            {users.length === 0 ? "Start typing to search." : "No users found."}
          </Text>
        </View>
      )}
    </View>
  );
};

export default SearchPage;
