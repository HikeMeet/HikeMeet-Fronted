import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Group } from "../../interfaces/group-interface";
import { Trip } from "../../interfaces/trip-interface";
import TripRow from "../../components/trip-row";
import MapDirectionButton from "../../components/get-direction";
import HikersButton from "../../components/hiker-button-list-group-members";
import PendingButton from "../../components/hiker-button-list-group-pendings";
import { useAuth } from "../../contexts/auth-context";

interface SingleGroupProps {
  navigation: any;
  route: {
    params: { groupId: string };
  };
}

interface GroupTrip {
  group: Group;
  trip: Trip;
}
const SingleGroupPage: React.FC<SingleGroupProps> = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { mongoId } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}?getTrip=true`
        );
        if (!response.ok) throw new Error("Failed to fetch group");
        const data: GroupTrip = await response.json();
        setGroup(data.group);
        setTrip(data.trip);
      } catch (error) {
        console.error("Error fetching group:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

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
  // Determine if the current user is an admin
  const isAdmin = group.members.some(
    (member) => member.user === mongoId && member.role === "admin"
  );
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Group Header */}
        <Text className="text-3xl font-bold mb-4">{group.name}</Text>

        {/* Description */}
        <View className="p-4 border-b border-gray-200">
          <Text className="font-semibold text-gray-600">Description</Text>
          <Text className="text-gray-800">
            {group.description || "No description"}
          </Text>
        </View>

        {/* Trip Row - Clickable using TripRow component */}
        {trip && (
          <TripRow
            trip={trip}
            onPress={() =>
              navigation.push("TripsStack", {
                screen: "TripPage",
                params: {
                  tripId: trip._id,
                },
              })
            }
          />
        )}

        {/* Members List */}
        {group.members && (
          <HikersButton members={group.members} navigation={navigation} />
        )}

        {/* Pending Button, rendered only if current user is an admin */}
        {isAdmin && group.pending && (
          <PendingButton pending={group.pending} navigation={navigation} />
        )}

        {/* Row with two boxes */}
        <View className="flex-row justify-between mb-4 mt-6">
          {/* Max Members Box */}
          <View className="flex-1 p-4 mr-2 border border-gray-200 rounded">
            <Text className="font-semibold text-gray-600">Max Members</Text>
            <Text className="text-gray-800">{group.max_members}</Text>
          </View>

          {/* Difficulty Box */}
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
          {group.embarked_at ? (
            (() => {
              const [hours, minutes] = group.embarked_at.split(":");
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
              return (
                <View className="flex-row items-center space-x-1">
                  <View className="px-2 py-1 border border-gray-200 rounded">
                    <Text className="text-gray-800">{year}</Text>
                  </View>
                  <Text className="text-gray-800 font-semibold">/</Text>
                  <View className="px-2 py-1 border border-gray-200 rounded">
                    <Text className="text-gray-800">{month}</Text>
                  </View>
                  <Text className="text-gray-800 font-semibold">/</Text>
                  <View className="px-2 py-1 border border-gray-200 rounded">
                    <Text className="text-gray-800">{day}</Text>
                  </View>
                </View>
              );
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
              return (
                <View className="flex-row items-center space-x-1">
                  <View className="px-2 py-1 border border-gray-200 rounded">
                    <Text className="text-gray-800">{year}</Text>
                  </View>
                  <Text className="text-gray-800 font-semibold">/</Text>
                  <View className="px-2 py-1 border border-gray-200 rounded">
                    <Text className="text-gray-800">{month}</Text>
                  </View>
                  <Text className="text-gray-800 font-semibold">/</Text>
                  <View className="px-2 py-1 border border-gray-200 rounded">
                    <Text className="text-gray-800">{day}</Text>
                  </View>
                </View>
              );
            })()
          ) : (
            <Text className="text-gray-800">Not set</Text>
          )}
        </View>

        {/* Created By */}
        <View className="p-4 border-b border-gray-200">
          <Text className="font-semibold text-gray-600">Created By</Text>
          <Text className="text-gray-800">{group.created_by}</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default SingleGroupPage;
