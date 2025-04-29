import React, { useState, useCallback, useRef } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { Text } from "react-native";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";
import SearchInput from "../../components/search-input";
import UserRow from "../../components/user-row-search";
import GroupRow from "../groups/components/group-row";
import TripRow from "../trips/component/trip-row";
import SearchFilters from "./components/search-filters";
import SearchFooter from "./components/see-more-button";
import EmptyResults from "./components/empty-results";

const SearchPage = ({ navigation }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [lastQuery, setLastQuery] = useState<string>("");
  const [resultsToShow, setResultsToShow] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const { mongoId } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const searchContent = async (query: string, reset = true) => {
    if (!query.trim()) {
      setUsers([]);
      setGroups([]);
      setTrips([]);
      setLastQuery("");
      setResultsToShow(10);
      return;
    }

    if (reset) {
      setLoading(true);
      setResultsToShow(10);
    }

    try {
      if (filter === "All" || filter === "Groups") {
        const res = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/search/groups?query=${query}`
        );
        const { groups: groupList = [] } = await res.json();
        reset
          ? setGroups(groupList)
          : setGroups((prev) => [...prev, ...groupList]);
      }

      if (filter === "All" || filter === "Trip") {
        const res = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/search/trips?query=${query}`
        );
        const { trips: tripList = [] } = await res.json();
        reset ? setTrips(tripList) : setTrips((prev) => [...prev, ...tripList]);
      }

      if (filter === "All" || filter === "Hikes") {
        const userRes = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/search/users?query=${query}`
        );
        const { friends: userList = [] } = await userRes.json();
        const friendRes = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/friend/${mongoId}`
        );
        const { friends: friendList = [] } = await friendRes.json();

        const updatedUsers = userList.map((u: any) => {
          const match = friendList.find(
            (f: any) => f.id === u._id || f.id === u._id.toString()
          );
          return { ...u, friendStatus: match?.status || "none" };
        });

        reset
          ? setUsers(updatedUsers)
          : setUsers((prev) => [...prev, ...updatedUsers]);
      }

      setLastQuery(query);
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

  //debouncedSearch
  const debouncedSearch = (text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => searchContent(text, true), 750);
  };

  const handleStatusChange = (newStatus: string, id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, friendStatus: newStatus } : u))
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (lastQuery) debouncedSearch(lastQuery);
    }, [lastQuery, filter])
  );

  const allData =
    filter === "Groups"
      ? groups
      : filter === "Trip"
        ? trips
        : filter === "Hikes"
          ? users.filter((u) => u._id !== mongoId)
          : [...users.filter((u) => u._id !== mongoId), ...groups, ...trips];

  const visibleData = allData.slice(0, resultsToShow);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <SearchInput
          placeholder="Search Everything..."
          onChangeText={debouncedSearch}
          autoFocus
        />
      </View>

      {/* Filters */}
      <SearchFilters filter={filter} setFilter={setFilter} />

      {/* Results */}
      {loading && visibleData.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-gray-500 mt-2">Loading...</Text>
        </View>
      ) : (
        <FlatList
          ListEmptyComponent={!loading ? <EmptyResults /> : null}
          data={visibleData}
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
          ListFooterComponent={
            <SearchFooter
              loadingMore={loadingMore}
              canLoadMore={resultsToShow < allData.length}
              onPress={() => {
                setLoadingMore(true);
                setTimeout(() => {
                  setResultsToShow((prev) => prev + 10);
                  setLoadingMore(false);
                }, 600);
              }}
            />
          }
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

export default SearchPage;
