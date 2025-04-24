import { useState, useEffect, useCallback } from "react";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { Group } from "../../interfaces/group-interface";
import { Trip } from "../../interfaces/trip-interface";
import { useAuth } from "../../contexts/auth-context";
import { fetchGroupDetails } from "../../components/requests/fetch-group-and-users-data";

import ProfileImage from "../../components/profile-image";
import JoinGroupActionButton from "../../components/group-join-action-button";
import GroupDetails from "./components/group-details";
import GroupPostList from "./components/group-posts";

interface SingleGroupProps {
  navigation: any;
  route: {
    params: { groupId: string; fromCreate?: boolean };
  };
}

const SingleGroupPage: React.FC<SingleGroupProps> = ({ route, navigation }) => {
  const { groupId, fromCreate } = route.params;
  const { mongoId } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"details" | "posts">("details");

  useFocusEffect(
    useCallback(() => {
      if (fromCreate) {
        const onBackPress = () => {
          navigation.navigate("Tabs", { screen: "Groups" });
          return true;
        };
        BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () =>
          BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      }
      return undefined;
    }, [fromCreate, navigation])
  );

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGroupDetails(groupId, true);
      setGroup(data.group);
      setTrip(data.trip ?? null);
    } catch (error) {
      console.error("Error fetching group:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Group not available or deleted.</Text>
      </SafeAreaView>
    );
  }

  const isAdmin = group.members.some(
    (member) => member.user === mongoId && member.role === "admin"
  );

  // Header with group info, HikersSwitcher, and tab buttons; always visible at the top.
  const renderHeader = () => (
    <View className="px-4 pt-4 pb-2 bg-white">
      <View className="flex-row items-center justify-between mb-4">
        {group.main_image && (
          <ProfileImage
            initialImage={group.main_image!}
            size={60}
            id={group._id}
            uploadType="group"
            editable={mongoId === group.created_by}
          />
        )}
        <Text
          className="text-lg font-bold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {group.name}
        </Text>
        <JoinGroupActionButton
          group={group}
          navigation={navigation}
          isInGroupPage={true}
          onAction={fetchGroup}
        />
        {mongoId === group.created_by && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("GroupsStack", {
                screen: "EditGroupPage",
                params: { group },
              })
            }
            className="ml-2 p-2 bg-blue-500 rounded"
          >
            <Text className="text-white font-semibold">Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab buttons */}
      <View className="flex-row justify-around mt-4 mb-2">
        <TouchableOpacity onPress={() => setActiveTab("details")}>
          <Text
            className={`text-lg font-semibold ${
              activeTab === "details" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("posts")}>
          <Text
            className={`text-lg font-semibold ${
              activeTab === "posts" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Posts
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Fixed header */}
      {renderHeader()}

      {/* Content area changes based on active tab */}
      {activeTab === "details" ? (
        <ScrollView className="px-4 pb-4" showsVerticalScrollIndicator={false}>
          <GroupDetails
            group={group}
            trip={trip!}
            navigation={navigation}
            isAdmin={isAdmin}
          />
          <TouchableOpacity
            onPress={() => navigation.push("Tabs", { screen: "Groups" })}
            className="bg-purple-500 px-4 py-3 rounded mt-6"
          >
            <Text className="text-white text-center font-semibold">
              Back to Group List
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        // Posts tab: only the posts list is scrollable; header stays fixed.
        <View className="flex-1">
          <GroupPostList
            groupId={group._id}
            navigation={navigation}
            isMember={group.members.some((member) => member.user === mongoId)}
          />
          <View className="px-4 pb-4">
            <TouchableOpacity
              onPress={() => navigation.push("Tabs", { screen: "Groups" })}
              className="bg-purple-500 px-4 py-3 rounded mt-2"
            >
              <Text className="text-white text-center font-semibold">
                Back to Group List
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SingleGroupPage;
