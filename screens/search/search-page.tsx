import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";
import SearchInput from "../../components/search-input";
import UserRow from "../../components/user-row-search";

const SearchPage = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [lastQuery, setLastQuery] = useState<string>(""); // store last search query
  const { mongoId } = useAuth();

  const searchFriends = async (query: string): Promise<any[]> => {
    if (!query.trim()) {
      setUsers([]);
      setLastQuery("");
      return [];
    }
    setLastQuery(query);
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

  // Callback to update a user's friend status in the list.
  const handleStatusChange = (newStatus: string, userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u._id === userId ? { ...u, friendStatus: newStatus } : u
      )
    );
  };

  // Refresh friend statuses when screen regains focus.
  useFocusEffect(
    useCallback(() => {
      if (lastQuery) {
        searchFriends(lastQuery);
      }
    }, [lastQuery])
  );

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
          {users
            .filter((user) => user._id !== mongoId)
            .map((user: any, index: number) => (
              <UserRow
                key={user._id || index}
                user={user}
                onStatusChange={(newStatus: string) =>
                  handleStatusChange(newStatus, user._id)
                }
                navigation={navigation}
              />
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
