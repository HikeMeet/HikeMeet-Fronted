// GroupDetails.tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import MapDirectionButton from "../../../components/get-direction";
import { Group } from "../../../interfaces/group-interface";
import { formatDateToHHMM } from "./edit-page-components";
import { DateDisplay } from "../../../components/date-present";
import TripRow from "../../../components/trip-row";
import { Trip } from "../../../interfaces/trip-interface";
import HikersSwitcher from "../../../components/hiker-button-list-group-combined";

interface GroupDetailsProps {
  group: Group;
  trip: Trip;
  navigation: any;
  isAdmin: boolean;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({
  group,
  trip,
  navigation,
  isAdmin,
}) => {
  return (
    <>
      <ScrollView>
        {/* Description */}
        <View className="p-4 border-b border-gray-200">
          <Text className="font-semibold text-gray-600">Description</Text>
          <Text className="text-gray-800">
            {group.description || "No description"}
          </Text>
        </View>
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

        {/* Hikers */}
        <HikersSwitcher
          group={group}
          navigation={navigation}
          isAdmin={isAdmin}
        />
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
        {/* Finish Time */}
        <View className="p-4 border-b border-gray-200 flex-row items-center justify-between">
          <Text className="font-semibold text-gray-600">Finish time</Text>
          {group.scheduled_end ? (
            (() => {
              const [hours, minutes] = formatDateToHHMM(
                new Date(group.scheduled_end)
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
      </ScrollView>
    </>
  );
};

export default GroupDetails;
