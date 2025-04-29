import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
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
import TripFilterModal from "../../components/TripFilterModal";
import GroupFilterModal from "../../components/GroupFilterModal";

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

  const [showTripFilterModal, setShowTripFilterModal] = useState(false);
  const [showGroupFilterModal, setShowGroupFilterModal] = useState(false);

  const [allTripsBackup, setAllTripsBackup] = useState<any[]>([]);
  const [allGroupsBackup, setAllGroupsBackup] = useState<any[]>([]);

  const [searchTrips, setSearchTrips] = useState<any[]>([]);
  const [searchGroups, setSearchGroups] = useState<any[]>([]);

  const [tripFilters, setTripFilters] = useState<
    { id: string; label: string }[]
  >([]);
  const [groupFilters, setGroupFilters] = useState<
    { id: string; label: string }[]
  >([]);

  //two function that filter after search
  const applyTripFilters = (tripsList: any[]) => {
    let filtered = [...tripsList];
    tripFilters.forEach((f) => {
      if (f.id.startsWith("tripTag=")) {
        const tag = f.id.split("=")[1];
        filtered = filtered.filter((t) => (t as any).tags?.includes(tag));
      }
      if (f.id.startsWith("tripLocation=")) {
        const loc = f.id.split("=")[1].toLowerCase();
        filtered = filtered.filter((t) =>
          t.location.address?.toLowerCase().includes(loc)
        );
      }
    });
    setTrips(filtered);
  };

  const applyGroupFilters = (groupsList: any[]) => {
    let filtered = [...groupsList];
    groupFilters.forEach((f) => {
      if (f.id.startsWith("groupDifficulty=")) {
        const diff = f.id.split("=")[1];
        filtered = filtered.filter((g: any) => g.difficulty === diff);
      }
      if (f.id.startsWith("groupStatus=")) {
        const status = f.id.split("=")[1].toLowerCase();
        filtered = filtered.filter((g) => g.status?.toLowerCase() === status);
      }
      if (f.id.startsWith("groupMaxMembers=")) {
        const max = parseInt(f.id.split("=")[1], 10);
        if (!isNaN(max)) {
          filtered = filtered.filter((g) => g.max_members <= max);
        }
      }
      if (f.id.startsWith("groupStart=")) {
        const start = f.id.split("=")[1];
        filtered = filtered.filter((g: any) => g.scheduled_start >= start);
      }
      if (f.id.startsWith("groupEnd=")) {
        const end = f.id.split("=")[1];
        filtered = filtered.filter((g: any) => g.scheduled_end <= end);
      }
    });
    setGroups(filtered);
  };

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
        if (reset) {
          setGroups(groupList);
          setAllGroupsBackup(groupList);
          setSearchGroups(groupList);
          if (filter === "Groups") applyGroupFilters(searchGroups);
        } else {
          setGroups((prev) => [...prev, ...groupList]);
          setAllGroupsBackup((prev) => [...prev, ...groupList]);
          setSearchGroups((prev) => [...prev, ...groupList]);
        }
      }

      if (filter === "All" || filter === "Trip") {
        const res = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/search/trips?query=${query}`
        );
        const { trips: tripList = [] } = await res.json();
        if (reset) {
          setTrips(tripList);
          setAllTripsBackup(tripList);
          setSearchTrips(tripList);
          if (filter === "Trip") applyTripFilters(searchTrips);
        } else {
          setTrips((prev) => [...prev, ...tripList]);
          setAllTripsBackup((prev) => [...prev, ...tripList]);
          setSearchTrips((prev) => [...prev, ...tripList]);
        }
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

  useEffect(() => {
    if (filter === "Trip") {
      applyTripFilters(searchTrips);
    }
    if (filter === "Groups") {
      applyGroupFilters(searchGroups);
    }
  }, [filter, tripFilters, groupFilters, searchTrips, searchGroups]);

  useFocusEffect(
    useCallback(() => {
      if (lastQuery) {
        debouncedSearch(lastQuery);
      }
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

  const removeFilter = (filterId: string) => {
    if (filter === "Trip") {
      const newFilters = tripFilters.filter((f) => f.id !== filterId);
      setTripFilters(newFilters);

      let filteredTrips = [...searchTrips];

      newFilters.forEach((f) => {
        if (f.id.startsWith("tripTag=")) {
          const tag = f.id.split("=")[1];
          filteredTrips = filteredTrips.filter((t) =>
            (t as any).tags?.includes(tag)
          );
        }
        if (f.id.startsWith("tripLocation=")) {
          const loc = f.id.split("=")[1].toLowerCase();
          filteredTrips = filteredTrips.filter((t) =>
            t.location.address?.toLowerCase().includes(loc)
          );
        }
      });

      setTrips(filteredTrips);
    }

    if (filter === "Groups") {
      const newFilters = groupFilters.filter((f) => f.id !== filterId);
      setGroupFilters(newFilters);

      let filteredGroups = [...searchGroups];

      newFilters.forEach((f) => {
        if (f.id.startsWith("groupDifficulty=")) {
          const diff = f.id.split("=")[1];
          filteredGroups = filteredGroups.filter(
            (g: any) => g.difficulty === diff
          );
        }
        if (f.id.startsWith("groupStatus=")) {
          const status = f.id.split("=")[1].toLowerCase();
          filteredGroups = filteredGroups.filter(
            (g) => g.status?.toLowerCase() === status
          );
        }
        if (f.id.startsWith("groupMaxMembers=")) {
          const max = parseInt(f.id.split("=")[1], 10);
          if (!isNaN(max)) {
            filteredGroups = filteredGroups.filter((g) => g.max_members <= max);
          }
        }
        if (f.id.startsWith("groupStart=")) {
          const start = f.id.split("=")[1];
          filteredGroups = filteredGroups.filter(
            (g: any) => g.scheduled_start >= start
          );
        }
        if (f.id.startsWith("groupEnd=")) {
          const end = f.id.split("=")[1];
          filteredGroups = filteredGroups.filter(
            (g: any) => g.scheduled_end <= end
          );
        }
      });

      setGroups(filteredGroups);
    }
  };

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

      {/* Filters Tabs */}
      <SearchFilters filter={filter} setFilter={setFilter} />

      {/* Active Filters + Filter Button */}
      {(filter === "Trip" || filter === "Groups") && (
        <View className="flex-row items-center justify-between px-4 py-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
            className="flex-row"
          >
            {(filter === "Trip" ? tripFilters : groupFilters).map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => removeFilter(filter.id)}
                className="bg-gray-200 px-5 py-2.5 rounded-full mr-2"
              >
                <Text className="text-gray-700 text-xs">{filter.label} ✕</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => {
              if (filter === "Trip") setShowTripFilterModal(true);
              if (filter === "Groups") setShowGroupFilterModal(true);
            }}
            className="bg-blue-500 px-4 py-1.5 rounded-full ml-2"
          >
            <Text className="text-white text-sm font-semibold">Filter</Text>
          </TouchableOpacity>
        </View>
      )}

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
      {/* Trip Filter Modal */}
      <TripFilterModal
        visible={showTripFilterModal}
        onClose={() => setShowTripFilterModal(false)}
        trips={allTripsBackup}
        initialFilters={{
          location:
            tripFilters
              .find((f) => f.id.startsWith("tripLocation="))
              ?.id.split("=")[1] || "",
          tags: tripFilters
            .filter((f) => f.id.startsWith("tripTag="))
            .map((f) => f.id.split("=")[1]),
        }}
        onApply={(filteredTrips, chosenFilters) => {
          setTrips(filteredTrips);
          setTripFilters(chosenFilters);
          setShowTripFilterModal(false);
        }}
      />

      {/* Group Filter Modal */}
      <GroupFilterModal
        visible={showGroupFilterModal}
        onClose={() => setShowGroupFilterModal(false)}
        groups={allGroupsBackup}
        initialFilters={{
          difficulties: groupFilters
            .filter((f) => f.id.startsWith("groupDifficulty="))
            .map((f) => f.id.split("=")[1]),
          statuses: groupFilters
            .filter((f) => f.id.startsWith("groupStatus="))
            .map((f) => f.id.split("=")[1]),
          maxMembers:
            groupFilters
              .find((f) => f.id.startsWith("groupMaxMembers="))
              ?.id.split("=")[1] || "",
          scheduledStart:
            groupFilters
              .find((f) => f.id.startsWith("groupStart="))
              ?.id.split("=")[1] || "",
          scheduledEnd:
            groupFilters
              .find((f) => f.id.startsWith("groupEnd="))
              ?.id.split("=")[1] || "",
        }}
        onApply={(filteredGroups, chosenFilters) => {
          setGroups(filteredGroups);
          setGroupFilters(chosenFilters);
          setShowGroupFilterModal(false);
        }}
      />
    </View>
  );
};

export default SearchPage;
