import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import FriendButton from "../../components/friend-button";
import SearchInput from "../../components/search-input";

const SearchPage = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const { mongoId } = useAuth();

  const fetchFriendStatuses = async (userList: any[]) => {
    const updatedUsers = await Promise.all(
      userList.map(async (user) => {
        try {
          const response = await fetch(
            `${process.env.EXPO_LOCAL_SERVER}/api/friends/status?userId=${mongoId}&friendId=${user._id}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );
          if (response.ok) {
            const data = await response.json();
            return { ...user, friendStatus: data.status || "none" };
          }
        } catch (error) {
          console.error(`Error fetching friend status for user ${user._id}:`, error);
        }
        return { ...user, friendStatus: "none" };
      })
    );
    setUsers(updatedUsers);
  };

  const searchFriends = async (query: string): Promise<any[]> => {
    if (!query.trim()) {
      setUsers([]);
      return [];
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/search/friends?query=${query}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to fetch search results");
      }
      const data = await response.json();
      const userList = data.friends || [];
      fetchFriendStatuses(userList);
      return userList;
    } catch (error) {
      console.error("Error fetching search results:", error);
      setUsers([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
              <Text className="text-xl font-bold"></Text>
            </View>

      {/*search component*/}
      <View className="px-3 pt-4 pb-3">
        <SearchInput
          placeholder="Search Everything..."
          onChangeText={searchFriends}
          autoFocus={true}
        />
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
                  ? navigation.navigate("ProfilePage")
                  : navigation.navigate("UserProfile", { userId: user._id })
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
