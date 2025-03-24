import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Group } from "../../interfaces/group-interface";
import GroupRow from "../../components/group-row";
import { useAuth } from "../../contexts/auth-context";

const GroupsPage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [showMyGroups, setShowMyGroups] = useState<boolean>(false);
  const { mongoId } = useAuth();

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/list`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }
      const data: Group[] = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups])
  );

  // First, filter groups by search text.
  let filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // If "My Groups" is toggled, further filter groups by created_by.
  // Assume that the current user's mongoId is available somehow.
  // For this example, we simply hard-code a value or you can get it via context.

  if (showMyGroups) {
    filteredGroups = filteredGroups.filter(
      (group) =>
        group.created_by === mongoId ||
        group.members.some((member) => member.user === mongoId)
    );
  }
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
          onPress={() => setShowMyGroups((prev) => !prev)}
          className="bg-blue-500 px-4 py-2 rounded relative"
        >
          {showMyGroups && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderWidth: 2,
                borderColor: "#1E40AF", // blue-900 color
                borderRadius: 8, // match the parent's rounded value
              }}
            />
          )}
          <Text className="text-white text-sm font-semibold text-center">
            My Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.push("GroupsStack")}
          className="bg-green-500 px-4 py-2 rounded"
        >
          <Text className="text-white font-semibold">+ Create Group</Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : filteredGroups.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-lg">No groups found.</Text>
          </View>
        ) : (
          filteredGroups.map((group) => (
            <GroupRow key={group._id} group={group} navigation={navigation} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GroupsPage;
