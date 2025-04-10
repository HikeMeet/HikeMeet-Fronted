import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import GroupRow from "./components/group-row";
import { useFocusEffect } from "@react-navigation/native";
import { Group } from "../../interfaces/group-interface";
import { useAuth } from "../../contexts/auth-context";
import { fetchGroups } from "../../components/requests/fetch-groups";

const GroupsPage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { mongoId } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [showMyGroups, setShowMyGroups] = useState<boolean>(false);
  // Only show 5 groups initially.
  const [groupsToShow, setGroupsToShow] = useState<number>(5);

  const handleFetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchGroups();
      setGroups(response);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      handleFetchGroups();
    }, [handleFetchGroups])
  );

  const handleAction = useCallback(
    (updatedGroup?: Group) => {
      if (updatedGroup) {
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === updatedGroup._id ? updatedGroup : group
          )
        );
      } else {
        handleFetchGroups();
      }
    },
    [handleFetchGroups]
  );

  // Filter groups based on search text.
  let filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // If "My Groups" is toggled, further filter groups by created_by or membership.
  if (showMyGroups) {
    filteredGroups = filteredGroups.filter(
      (group) =>
        group.created_by === mongoId ||
        group.members.some((member) => member.user === mongoId)
    );
  }

  // Pagination: data for FlatList.
  const displayedGroups = filteredGroups.slice(0, groupsToShow);
  const handleLoadMore = useCallback(() => {
    if (groupsToShow < filteredGroups.length) {
      setGroupsToShow((prev) => prev + 5);
    }
  }, [groupsToShow, filteredGroups.length]);

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
        <TouchableOpacity className="p-2 bg-gray-200 rounded-full">
          <Text className="text-sm">Filter</Text>
        </TouchableOpacity>
      </View>

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
