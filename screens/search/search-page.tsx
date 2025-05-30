import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";
import SearchInput from "../../components/search-input";
import SearchFilters from "./components/search-filters";
import TripFilterModal from "../../components/TripFilterModal";
import GroupFilterModal from "../../components/GroupFilterModal";
import UserRow from "../../components/user-row-search";
import GroupRow from "../groups/components/group-row";
import TripRow from "../trips/component/trip-row";
import SearchFooter from "./components/see-more-button";
import EmptyResults from "./components/empty-results";
import {
  filterGroupsByFilters,
  filterTripsByFilters,
} from "./components/filters";
import {
  fetchAll,
  fetchGroups,
  fetchTrips,
  fetchUsers,
} from "./components/search-api";

const SearchPage = ({ navigation }: any) => {
  const { mongoId, mongoUser } = useAuth();
  const [filter, setFilter] = useState("All");
  const [lastQuery, setLastQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [resultsToShow, setResultsToShow] = useState(10);

  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const [tripFilters, setTripFilters] = useState<
    { id: string; label: string }[]
  >([]);
  const [groupFilters, setGroupFilters] = useState<
    { id: string; label: string }[]
  >([]);

  const [showTripFilterModal, setShowTripFilterModal] = useState(false);
  const [showGroupFilterModal, setShowGroupFilterModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [allTripsBackup, setAllTripsBackup] = useState<any[]>([]);
  const [allGroupsBackup, setAllGroupsBackup] = useState<any[]>([]);

  const searchContent = async (query: string, reset = true) => {
    if (!query.trim()) {
      setUsers([]);
      setGroups([]);
      setTrips([]);
      return;
    }
    setLoading(reset);

    try {
      if (filter === "All") {
        const { friends, trips, groups } = await fetchAll(query, mongoId ?? "");

        const updatedUsers = friends.map((u: any) => ({
          ...u,
          friendStatus:
            mongoUser?.friends?.find((f) => f.id === u._id)?.status || "none",
        }));

        setUsers(updatedUsers);
        setTrips(trips);
        setGroups(groups);
        setAllTripsBackup(trips);
        setAllGroupsBackup(groups);
      } else if (filter === "Groups") {
        const groupList = await fetchGroups(query);
        setGroups(filterGroupsByFilters(groupList, groupFilters));
        setAllGroupsBackup(groupList);
      } else if (filter === "Trip") {
        const tripList = await fetchTrips(query);
        setTrips(filterTripsByFilters(tripList, tripFilters));
        setAllTripsBackup(tripList);
      } else if (filter === "Hikes") {
        const userList = await fetchUsers(query, mongoId ?? "");
        const updated = userList.map((u: any) => ({
          ...u,
          friendStatus:
            mongoUser?.friends?.find((f) => f.id === u._id)?.status || "none",
        }));
        setUsers(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = (text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLastQuery(text);
      searchContent(text);
    }, 600);
  };

  useEffect(() => {
    if (lastQuery.trim()) {
      searchContent(lastQuery);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [])
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

  const removeFilter = (filterId: string) => {
    if (filter === "Trip") {
      const newFilters = tripFilters.filter((f) => f.id !== filterId);
      setTripFilters(newFilters);
      setTrips(filterTripsByFilters(allTripsBackup, newFilters));
    } else if (filter === "Groups") {
      const newFilters = groupFilters.filter((f) => f.id !== filterId);
      setGroupFilters(newFilters);
      setGroups(filterGroupsByFilters(allGroupsBackup, newFilters));
    }
  };

  return (
    <View className="flex-1 px-3 p-2 bg-white">
      <SearchInput
        placeholder="Search..."
        onChangeText={debouncedSearch}
        autoFocus
      />
      <SearchFilters filter={filter} setFilter={setFilter} />

      {/* Filters Tags */}
      {(filter === "Trip" || filter === "Groups") && (
        <View className="flex-row items-center px-4 py-2">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filter === "Trip" ? tripFilters : groupFilters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => removeFilter(item.id)}
                className="bg-gray-200 px-5 py-2.5 rounded-full mr-2"
              >
                <Text className="text-gray-700 text-xs">{item.label} ✕</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ alignItems: "center" }}
          />
          <TouchableOpacity
            onPress={() =>
              filter === "Trip"
                ? setShowTripFilterModal(true)
                : setShowGroupFilterModal(true)
            }
          >
            <Text>Add Filter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={visibleData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) =>
            item.username ? (
              <UserRow
                user={item}
                navigation={navigation}
                onStatusChange={function (newStatus: string): void {
                }}
              />
            ) : item.max_members ? (
              <GroupRow
                group={item}
                onPress={() =>
                  navigation.navigate("GroupsStack", {
                    screen: "GroupPage",
                    params: { groupId: item._id },
                  })
                }
                navigation={undefined}
              />
            ) : (
              <TripRow
                trip={item}
                onPress={() =>
                  navigation.push("TripsStack", {
                    screen: "TripPage",
                    params: { tripId: item._id },
                  })
                }
              />
            )
          }
          ListEmptyComponent={!loading ? <EmptyResults /> : null}
          ListFooterComponent={
            <SearchFooter
              loadingMore={loadingMore}
              canLoadMore={resultsToShow < allData.length}
              onPress={() => {
                setLoadingMore(true);
                setTimeout(() => {
                  setResultsToShow((prev) => prev + 10);
                  setLoadingMore(false);
                }, 500);
              }}
            />
          }
        />
      )}

      {/* Modals */}
      <TripFilterModal
        visible={showTripFilterModal}
        onClose={() => setShowTripFilterModal(false)}
        trips={trips}
        onApply={(filtered, filters) => {
          setTrips(filtered);
          setTripFilters(filters);
          setShowTripFilterModal(false);
        }}
      />
      <GroupFilterModal
        visible={showGroupFilterModal}
        onClose={() => setShowGroupFilterModal(false)}
        groups={groups}
        onApply={(filtered, filters) => {
          setGroups(filtered);
          setGroupFilters(filters);
          setShowGroupFilterModal(false);
        }}
      />
    </View>
  );
};

export default SearchPage;
