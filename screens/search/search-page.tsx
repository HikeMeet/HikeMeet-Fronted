import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";
import SearchInput from "../../components/search-input";
import UserRow from "../../components/user-row-search";

const SearchPage = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [lastQuery, setLastQuery] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { mongoId } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const searchFriends = async (query: string, reset = true) => {
    if (!query.trim()) {
      setUsers([]);
      setLastQuery("");
      setOffset(0);
      setHasMore(true);
      return;
    }

    if (reset) {
      setLoading(true);
      setOffset(0);
    }

    try {
      const userResponse = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/search/users?query=${query}&offset=${
          reset ? 0 : offset
        }`
      );
      if (!userResponse.ok) throw new Error("Failed to fetch search results");
      const { friends: userList = [] } = await userResponse.json();

      const friendResponse = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/friend/${mongoId}`
      );
      const { friends: friendList = [] } = friendResponse.ok
        ? await friendResponse.json()
        : { friends: [] };

      const updatedUsers = userList.map((u: any) => {
        const entry = friendList.find(
          (f: any) => f.id === u._id || f.id === u._id.toString()
        );
        return {
          ...u,
          friendStatus: entry?.status || "none",
        };
      });

      if (reset) setUsers(updatedUsers);
      else setUsers((prev) => [...prev, ...updatedUsers]);

      setOffset((prev) => prev + updatedUsers.length);
      setHasMore(updatedUsers.length > 0);
      setLastQuery(query);
    } catch (err) {
      console.error(err);
      if (reset) setUsers([]);
    } finally {
      if (reset) setLoading(false);
    }
  };

  const debouncedSearch = (text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      searchFriends(text);
    }, 750);
  };

  const handleStatusChange = (newStatus: string, id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, friendStatus: newStatus } : u))
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (lastQuery) searchFriends(lastQuery, true);
    }, [lastQuery])
  );

  const handleEndReached = () => {
    if (!loading && hasMore && lastQuery) {
      searchFriends(lastQuery, false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Search Input */}
      <View className="px-4 pt-4 pb-2">
        <SearchInput
          placeholder="Search Everything..."
          onChangeText={debouncedSearch}
          autoFocus
        />
      </View>

      {/* Filters */}
      <View className="px-4 pb-2">
        <ScrollView
          horizontal
          contentContainerStyle={{ paddingVertical: 8 }}
          showsHorizontalScrollIndicator={false}
        >
          {["All", "Groups", "Trip", "Hikes", "Posts"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              className={`px-3 py-1 rounded-full mx-1 ${
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
      {loading && users.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-gray-500 mt-2">Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={users.filter((u) => u._id !== mongoId)}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <View className="mb-1">
              <UserRow
                user={item}
                onStatusChange={(newStatus) =>
                  handleStatusChange(newStatus, item._id)
                }
                navigation={navigation}
              />
            </View>
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={() =>
            !loading && (
              <View className="flex-1 justify-center items-center mt-10">
                <Text className="text-gray-500">
                  {users.length === 0
                    ? "Start typing to search."
                    : "No users found."}
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

export default SearchPage;
