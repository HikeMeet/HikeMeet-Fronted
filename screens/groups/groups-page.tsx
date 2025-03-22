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

interface GroupsPageProps {
  navigation: any;
}

const GroupsPage: React.FC<GroupsPageProps> = ({ navigation }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");

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

  // Filter groups by search text
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

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

      {/* Buttons row: Create Group and My Groups */}
      <View className="flex-row justify-between mb-4">
        <TouchableOpacity
          onPress={() => console.log("My Groups")}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white font-semibold">My Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.push("GroupsStack")}
          className="bg-green-500 px-4 py-2 rounded"
        >
          <Text className="text-white font-semibold">Create Group</Text>
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
            <TouchableOpacity
              key={group._id}
              onPress={() =>
                navigation.navigate("GroupsStack", {
                  screen: "GroupPage",
                  params: {
                    groupId: group._id,
                  },
                })
              }
              className="flex-row items-center bg-gray-100 mb-4 p-4 rounded-lg"
            >
              <View className="flex-1">
                <Text
                  className="text-lg font-bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {group.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  Status: {group.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GroupsPage;
