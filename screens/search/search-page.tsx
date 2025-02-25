import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import SearchInput from "../../components/search-input";
import FriendActionButton from "../../components/friend-button";

const SearchPage = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const { mongoId } = useAuth();

  const searchFriends = async (query: string): Promise<any[]> => {
    if (!query.trim()) {
      setUsers([]);
      return [];
    }
    setLoading(true);
    try {
      // Fetch searched users.
      const userResponse = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/search/users?query=${query}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!userResponse.ok) {
        const errorResponse = await userResponse.json();
        throw new Error(
          errorResponse.error || "Failed to fetch search results"
        );
      }
      const data = await userResponse.json();
      const userList = data.friends || [];

      // Fetch the current user's friend list.
      const friendResponse = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/friend/${mongoId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      let friendList: any[] = [];
      if (friendResponse.ok) {
        const friendData = await friendResponse.json();
        friendList = friendData.friends || [];
      }
      console.log("::::friends:", friendList);
      // Map through userList and add friendStatus based on friendList.
      const updatedUsers = userList.map((user: any) => {
        const friendEntry = friendList.find(
          (f: any) => f.id === user._id || f.id === user._id.toString()
        );
        return {
          ...user,
          friendStatus: friendEntry ? friendEntry.status : "none",
        };
      });

      setUsers(updatedUsers);
      return updatedUsers;
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
        <Text className="text-xl font-bold">Search</Text>
      </View>

      {/* Search Input */}
      <View className="px-3 pt-4 pb-3">
        <SearchInput
          placeholder="Search Everything..."
          onChangeText={searchFriends}
          autoFocus={true}
        />
      </View>

      {/* Filters */}
      <View className="px-10">
        <ScrollView
          horizontal
          className="flex-row"
          contentContainerStyle={{ alignItems: "center" }}
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
                  ? navigation.navigate("ProfilePage")
                  : navigation.navigate("UserProfile", { userId: user._id })
              }
            >
              <View className="mb-2 p-4 bg-gray-100 rounded-lg flex-row items-center shadow-sm">
                <Image
                  source={{
                    uri:
                      user.profile_picture || "https://via.placeholder.com/50",
                  }}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <View className="flex-1">
                  <Text className="text-lg font-bold">{user.username}</Text>
                  <Text className="text-sm text-gray-500">
                    {`${user.first_name} ${user.last_name}`}
                  </Text>
                </View>
                {/* Friend Action Button with onStatusChange to update the user's friendStatus in the list */}
                {user._id !== mongoId && mongoId && (
                  <FriendActionButton
                    currentUserId={mongoId}
                    targetUserId={user._id}
                    status={user.friendStatus || "none"}
                    onStatusChange={(newStatus: string) => {
                      setUsers((prevUsers) =>
                        prevUsers.map((u) =>
                          u._id === user._id
                            ? { ...u, friendStatus: newStatus }
                            : u
                        )
                      );
                    }}
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
