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
import GroupRow from "../groups/components/group-row";
import TripRow from "../trips/component/trip-row";

const SearchPage = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [lastQuery, setLastQuery] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { mongoId } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const searchContent = async (query: string, reset = true) => {
    if (!query.trim()) {
      setUsers([]);
      setGroups([]);
      setTrips([]);
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
      if (filter === "All" || filter === "Groups") {
        const groupResponse = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/search/groups?query=${query}`
        );
        if (!groupResponse.ok) throw new Error("Failed to fetch groups");
        const { groups: groupList = [] } = await groupResponse.json();
        if (reset) setGroups(groupList);
        else setGroups((prev) => [...prev, ...groupList]);
      }

      if (filter === "All" || filter === "Trip") {
        const tripResponse = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/search/trips?query=${query}`
        );
        if (!tripResponse.ok) throw new Error("Failed to fetch trips");
        const { trips: tripList = [] } = await tripResponse.json();
        if (reset) setTrips(tripList);
        else setTrips((prev) => [...prev, ...tripList]);
      }

      if (filter === "All" || filter === "Hikes") {
        const userResponse = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/search/users?query=${query}`
        );
        if (!userResponse.ok) throw new Error("Failed to fetch users");
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
      }

      setLastQuery(query);
      setHasMore(false); // Update accordingly if you implement pagination later
    } catch (err) {
      console.error(err);
      if (reset) {
        setUsers([]);
        setGroups([]);
        setTrips([]);
      }
    } finally {
      if (reset) setLoading(false);
    }
  };

  const debouncedSearch = (text: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      searchContent(text, true);
    }, 750);
  };

  const handleStatusChange = (newStatus: string, id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, friendStatus: newStatus } : u))
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (lastQuery) {
        debouncedSearch(lastQuery);
      }
    }, [lastQuery, filter])
  );

  const handleEndReached = () => {
    if (!loading && hasMore && lastQuery) {
      searchContent(lastQuery, false);
    }
  };

  const getDataForRender = () => {
    if (filter === "Groups") return groups;
    if (filter === "Trip") return trips;
    if (filter === "Hikes") return users.filter((u) => u._id !== mongoId);
    if (filter === "All")
      return [...users.filter((u) => u._id !== mongoId), ...groups, ...trips];
    return [];
  };

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View className="mt-4 mb-8 items-center">
        <TouchableOpacity
          onPress={handleEndReached}
          className="px-6 py-2 bg-blue-500 rounded-full"
        >
          <Text className="text-white font-semibold">Load More</Text>
        </TouchableOpacity>
      </View>
    );
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
          {["All", "Hikes", "Groups", "Trip"].map((item) => (
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
      {loading && getDataForRender().length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-gray-500 mt-2">Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={getDataForRender()}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <View className="mb-1">
              {item.username ? (
                <UserRow
                  user={item}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(newStatus, item._id)
                  }
                  navigation={navigation}
                />
              ) : item.max_members ? (
                <GroupRow
                  group={item}
                  navigation={navigation}
                  onPress={() =>
                    navigation.navigate("GroupsStack", {
                      screen: "GroupPage",
                      params: { groupId: item._id },
                    })
                  }
                />
              ) : (
                <TripRow
                  trip={item}
                  onPress={() =>
                    navigation.navigate("TripsStack", {
                      screen: "TripPage",
                      params: { tripId: item._id },
                    })
                  }
                />
              )}
            </View>
          )}
          ListFooterComponent={renderFooter}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

export default SearchPage;
