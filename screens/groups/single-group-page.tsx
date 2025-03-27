import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Group } from "../../interfaces/group-interface";
import { Trip } from "../../interfaces/trip-interface";
import TripRow from "../../components/trip-row";
import MapDirectionButton from "../../components/get-direction";
import { useAuth } from "../../contexts/auth-context";
import HikersSwitcher from "../../components/hiker-button-list-group-combined";
import { useFocusEffect } from "@react-navigation/native";
import tw from "twrnc";
import JoinGroupActionButton from "../../components/group-join-action-button";
import { fetchGroupDetails } from "../../components/requests/fetch-group-and-users-data";
import { DateDisplay } from "../../components/date-present";
import { formatDateToHHMM } from "./components/edit-page-components";

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

  // Override hardware back button if coming from CreateGroupPage.
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
      setTrip(data.trip!);
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
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg">Group not found.</Text>
      </SafeAreaView>
    );
  }

  const isAdmin = group.members.some(
    (member) => member.user === mongoId && member.role === "admin"
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header: Group Name, Join, Edit, Delete */}
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className="text-3xl font-bold flex-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {group.name}
          </Text>
          <JoinGroupActionButton
            group={group}
            navigation={navigation}
            isInGroupPage={true}
          />
          {/* Edit button navigates to the EditGroupPage */}
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

        {/* Description */}
        <View className="p-4 border-b border-gray-200">
          <Text className="font-semibold text-gray-600">Description</Text>
          <Text className="text-gray-800">
            {group.description || "No description"}
          </Text>
        </View>

        {/* Trip Row */}
        {trip && (
          <TripRow
            trip={trip}
            onPress={() =>
              navigation.push("TripsStack", {
                screen: "TripPage",
                params: { tripId: trip._id },
              })
            }
          />
        )}

        {/* Hikers and Invite Friends Buttons */}
        {group.members && (
          <HikersSwitcher
            group={group}
            navigation={navigation}
            isAdmin={isAdmin}
          />
        )}

        {/* Row with two boxes */}
        <View className="flex-row justify-between mb-4 mt-6">
          <View className="flex-1 p-4 mr-2 border border-gray-200 rounded">
            <Text className="font-semibold text-gray-600">Max Members</Text>
            <Text className="text-gray-800">{group.max_members}</Text>
          </View>
          <View className="flex-1 p-4 ml-2 border border-gray-200 rounded">
            <Text className="font-semibold text-gray-600">Difficulty</Text>
            <Text className="text-gray-800">
              {group.difficulty || "Not set"}
            </Text>
          </View>
        </View>

        {/* Meeting Point with Get Directions */}
        <View className="p-4 border-b border-gray-200 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-semibold text-gray-600">Meeting Point</Text>
            <Text className="text-gray-800 text-lg">
              {group.meeting_point || "Not set"}
            </Text>
          </View>
          {group.meeting_point && (
            <MapDirectionButton destination={group.meeting_point} />
          )}
        </View>

        {/* Embarked At */}
        <View className="p-4 border-b border-gray-200 flex-row items-center justify-between">
          <Text className="font-semibold text-gray-600">Embarked At</Text>
          {group.scheduled_start ? (
            (() => {
              const [hours, minutes] = formatDateToHHMM(
                new Date(group.scheduled_start)
              ).split(":");
              return (
                <View className="flex-row items-center space-x-2">
                  <View className="px-3 py-2 border border-gray-200 rounded">
                    <Text className="text-gray-800">{hours}</Text>
                  </View>
                  <Text className="text-gray-800 font-semibold">:</Text>
                  <View className="px-3 py-2 border border-gray-200 rounded">
                    <Text className="text-gray-800">{minutes}</Text>
                  </View>
                </View>
              );
            })()
          ) : (
            <Text className="text-gray-800">Not set</Text>
          )}
        </View>

        {/* Scheduled Start */}
        <View className="p-4 border-b border-gray-200 flex-row items-center justify-between">
          <Text className="font-semibold text-gray-600">Scheduled Start</Text>
          {group.scheduled_start ? (
            (() => {
              const d = new Date(group.scheduled_start);
              const year = d.getFullYear().toString().slice(-2);
              const month = ("0" + (d.getMonth() + 1)).slice(-2);
              const day = ("0" + d.getDate()).slice(-2);
              return <DateDisplay dateParts={[year, month, day]} />;
            })()
          ) : (
            <Text className="text-gray-800">Not set</Text>
          )}
        </View>

        {/* Scheduled End */}
        <View className="p-4 border-b border-gray-200 flex-row items-center justify-between">
          <Text className="font-semibold text-gray-600">Scheduled End</Text>
          {group.scheduled_end ? (
            (() => {
              const d = new Date(group.scheduled_end);
              const year = d.getFullYear().toString().slice(-2);
              const month = ("0" + (d.getMonth() + 1)).slice(-2);
              const day = ("0" + d.getDate()).slice(-2);
              return <DateDisplay dateParts={[year, month, day]} />;
            })()
          ) : (
            <Text className="text-gray-800">Not set</Text>
          )}
        </View>

        {/* Created At */}
        <View className="p-4 border-b border-gray-200">
          <Text className="font-semibold text-gray-600">Created At</Text>
          <Text className="text-gray-800">
            {new Date(group.created_at).toLocaleString()}
          </Text>
        </View>

        {/* Updated At */}
        <View className="p-4">
          <Text className="font-semibold text-gray-600">Updated At</Text>
          <Text className="text-gray-800">
            {new Date(group.updated_at).toLocaleString()}
          </Text>
        </View>

        {/* Bottom Button to go to Group List */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Tabs", { screen: "Groups" })}
          style={tw`bg-purple-500 px-4 py-3 rounded mt-6`}
        >
          <Text style={tw`text-white text-center font-semibold`}>
            Back to Group List
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SingleGroupPage;
