import { useState, useCallback } from "react";
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import GroupRow from "./components/group-row";
import { useFocusEffect } from "@react-navigation/native";
import { Group } from "../../interfaces/group-interface";
import { useAuth } from "../../contexts/auth-context";
import { fetchGroups } from "../../components/requests/fetch-groups";
import { useChatList } from "../../contexts/chat-context";
import GroupFilterModal from "../../components/GroupFilterModal";

const GroupsPage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { mongoId, fetchMongoUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [showMyGroups, setShowMyGroups] = useState<boolean>(false);
  // Only show 5 groups initially.
  const [groupsToShow, setGroupsToShow] = useState<number>(5);
  const { initializeRooms } = useChatList();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [groupFilters, setGroupFilters] = useState<
    { id: string; label: string }[]
  >([]);
  const [allGroupsBackup, setAllGroupsBackup] = useState<Group[]>([]);

  const handleFetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchGroups();
      setGroups(response);
      setAllGroupsBackup(response);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterGroupsByFilters = (
    groups: Group[],
    filters: { id: string; label: string }[]
  ): Group[] => {
    if (filters.length === 0) return groups;

    const difficulties: string[] = [];
    const statuses: string[] = [];
    let maxMembers: number | undefined = undefined;
    let scheduledStart: string | undefined = undefined;
    let scheduledEnd: string | undefined = undefined;

    filters.forEach(({ id }) => {
      const [key, value] = id.split("=");

      if (key === "groupDifficulty") difficulties.push(value);
      else if (key === "groupStatus") statuses.push(value);
      else if (key === "groupMaxMembers") maxMembers = parseInt(value);
      else if (key === "groupStart") scheduledStart = value;
      else if (key === "groupEnd") scheduledEnd = value;
    });

    return groups.filter((g) => {
      // Only if there is a selected difficulty - adjustment required
      if (
        difficulties.length > 0 &&
        !difficulties.includes(g.difficulty || "")
      ) {
        return false;
      }

      // Only if there is a selected status - matching is required
      if (statuses.length > 0 && !statuses.includes(g.status || "")) {
        return false;
      }

      // If maximum number of participants is selected - adjustment required
      if (maxMembers !== undefined && g.max_members > maxMembers) {
        return false;
      }

      if (
        scheduledStart &&
        (!g.scheduled_start || g.scheduled_start < scheduledStart)
      ) {
        return false;
      }

      if (
        scheduledEnd &&
        (!g.scheduled_end || g.scheduled_end > scheduledEnd)
      ) {
        return false;
      }

      return true;
    });
  };

  const mapGroupFiltersToInitial = (
    filters: { id: string; label: string }[]
  ) => {
    const initial = {
      difficulties: [] as string[],
      statuses: [] as string[],
      maxMembers: undefined as string | undefined,
      scheduledStart: undefined as string | undefined,
      scheduledEnd: undefined as string | undefined,
    };

    filters.forEach((f) => {
      const [key, value] = f.id.split("=");
      if (key === "groupDifficulty") initial.difficulties.push(value);
      else if (key === "groupStatus") initial.statuses.push(value);
      else if (key === "groupMaxMembers") initial.maxMembers = value;
      else if (key === "groupStart") initial.scheduledStart = value;
      else if (key === "groupEnd") initial.scheduledEnd = value;
    });

    return initial;
  };

  useFocusEffect(
    useCallback(() => {
      // fetchMongoUser(mongoId!);
      // initializeRooms();
      handleFetchGroups();
    }, [handleFetchGroups])
  );

  const handleAction = useCallback(
    (updatedGroup?: Group) => {
      if (updatedGroup) {
        setGroups((prev) =>
          prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
        );
      } else {
        handleFetchGroups();
      }
    },
    [handleFetchGroups]
  );

  // Filter groups based on search text.
  let filteredGroups = filterGroupsByFilters(groups, groupFilters);

  filteredGroups = filteredGroups.filter((group) =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // If "My Groups" is toggled, further filter groups by created_by or membership.
  if (showMyGroups) {
    filteredGroups = filteredGroups.filter(
      (g) =>
        g.created_by === mongoId || g.members.some((m) => m.user === mongoId)
    );
  }
  // Pagination: data for FlatList.
  const displayedGroups = filteredGroups.slice(0, groupsToShow);
  const handleLoadMore = () => {
    if (groupsToShow < filteredGroups.length) {
      setGroupsToShow((prev) => prev + 5);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* Top row: Search and Filter */}
      <View className="flex-row items-center mb-4">
        <View className="flex-1 mr-2 bg-gray-100 rounded-full px-3 py-2">
          <TextInput
            placeholder="Search group"
            className="text-base"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="p-2 bg-gray-200 rounded-full"
        >
          <Text className="text-sm">Filter</Text>
        </TouchableOpacity>
      </View>

      {groupFilters.length > 0 && (
        <View className="flex-row items-center mb-2">
          <FlatList
            horizontal
            data={groupFilters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  const newFilters = groupFilters.filter(
                    (f) => f.id !== item.id
                  );
                  setGroupFilters(newFilters);
                  setGroups(filterGroupsByFilters(allGroupsBackup, newFilters));
                }}
                className="bg-gray-200 px-5 py-2.5 rounded-full mr-2"
              >
                <Text className="text-gray-700 text-xs">{item.label} ✕</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 4 }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Buttons row: My Groups and Create Group */}
      <View className="flex-row justify-between mb-4">
        <TouchableOpacity
          onPress={() => {
            handleAction();
            setShowMyGroups((prev) => !prev);
          }}
          className="bg-blue-500 px-4 py-2 rounded relative"
        >
          <Text className="text-white text-sm font-semibold text-center">
            {showMyGroups ? "All Groups" : "My Groups"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.push("GroupsStack")}
          className="bg-green-500 px-4 py-2 rounded"
        >
          <Text className="text-white font-semibold">+ Create Group</Text>
        </TouchableOpacity>
      </View>

      <GroupFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        groups={allGroupsBackup}
        onApply={(filtered, filters) => {
          setGroups(filtered);
          setGroupFilters(filters);
          setShowFilterModal(false);
        }}
        initialFilters={mapGroupFiltersToInitial(groupFilters)}
      />

      {/* Groups List as FlatList */}
      {loading ? (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : filteredGroups.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-20">
          <Text className="text-lg">No groups found.</Text>
        </View>
      ) : (
        <FlatList
          data={displayedGroups}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <GroupRow
              group={item}
              navigation={navigation}
              onAction={handleAction}
              onPress={() =>
                navigation.navigate("GroupsStack", {
                  screen: "GroupPage",
                  params: { groupId: item._id },
                })
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleFetchGroups}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default styled(GroupsPage);
