import { useEffect, useState } from "react";
import React from "react";
import { ScrollView, TouchableOpacity, Text, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth-context";
import { Group } from "../../interfaces/group-interface";
import GroupCreatedModal from "../../components/post-group-creatonal";
import * as Location from "expo-location";
import {
  LabeledTextInput,
  TripSelectorField,
  MaxMembersField,
  PrivacyField,
  DifficultyField,
  DateRangePickerField,
  TimeFields,
  formatDateToHHMM,
} from "./components/edit-page-components";
import { Trip } from "../../interfaces/trip-interface";
import MapSearch from "../../components/map-search-creaete-trip";

interface EditGroupPageProps {
  navigation: any;
  route: {
    params: {
      group: Group;
      trip: Trip;
    };
  };
}

const EditGroupPage: React.FC<EditGroupPageProps> = ({ navigation, route }) => {
  const { group, trip } = route.params;
  const { mongoId, userLocationState } = useAuth();

  // Initialize states with the group's current data.
  const [groupName, setGroupName] = useState<string>(group.name);
  const [selectedTrip, setSelectedTrip] = useState<Trip>(trip);
  const [maxMembers, setMaxMembers] = useState<string>(
    group.max_members.toString()
  );
  const [privacy, setPrivacy] = useState<"public" | "private">(group.privacy);
  const [description, setDescription] = useState<string>(
    group.description || ""
  );
  const [difficulty, setDifficulty] = useState<string>(group.difficulty || "");
  const [scheduledStart, setScheduledStart] = useState<Date | null>(
    group.scheduled_start ? new Date(group.scheduled_start) : null
  );
  const [scheduledEnd, setScheduledEnd] = useState<Date | null>(
    group.scheduled_end ? new Date(group.scheduled_end) : null
  );
  const [startTime, setStartTime] = useState<string>(
    group.scheduled_start
      ? formatDateToHHMM(new Date(group.scheduled_start))
      : ""
  );
  const [finishTime, setFinishTime] = useState<string>(
    group.scheduled_end ? formatDateToHHMM(new Date(group.scheduled_end)) : ""
  );
  const [showStartTimePicker, setShowStartTimePicker] =
    useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [showCreatedModal, setShowCreatedModal] = useState<boolean>(false);
  const [showMapSearch, setShowMapSearch] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [meetingPointLocation, setMeetingPointLocation] = useState<
    string | null
  >(group.meeting_point ? group.meeting_point.address : null);
  const [meetingPointCoordinates, setMeetingPointCoordinates] = useState<
    [number, number] | null
  >(group.meeting_point ? group.meeting_point.coordinates : null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  // Helper function to format date for backend (ISO string)
  const formatDateForBackend = (date: Date) => date.toISOString();

  const handleLocationSelect = (coords: [number, number], address: string) => {
    setMeetingPointLocation(address);
    setMeetingPointCoordinates(coords);
  };
  useEffect(() => {
    if (!selectedTrip || !showMapSearch) return;
    setMeetingPointLocation(selectedTrip.location.address);
    setMeetingPointCoordinates([
      selectedTrip.location.coordinates[0],
      selectedTrip.location.coordinates[1],
    ]);
  }, [selectedTrip]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setUserLocation([longitude, latitude]);
    })();
  }, []);

  // updateHandle constructs the update JSON with only changed fields and sends the update request.
  const updateHandle = async () => {
    setEditing(true);
    const updateData: any = {};

    if (groupName !== group.name) updateData.name = groupName;
    if (selectedTrip._id !== group.trip) updateData.trip = selectedTrip;
    if (maxMembers !== group.max_members.toString()) {
      updateData.max_members = parseInt(maxMembers, 10);
    }
    console.log(meetingPointLocation);
    console.log(group.meeting_point!.address);
    if (meetingPointLocation !== group.meeting_point!.address)
      updateData.meeting_point = {
        address: meetingPointLocation,
        coordinates: meetingPointCoordinates,
      };

    if (privacy !== group.privacy) updateData.privacy = privacy;
    if (description !== (group.description || ""))
      updateData.description = description;
    if (difficulty !== (group.difficulty || ""))
      updateData.difficulty = difficulty;

    if (scheduledStart) {
      const oldDate = new Date(group.scheduled_start || "");
      const newDate = scheduledStart;
      if (
        !group.scheduled_start ||
        oldDate.toDateString() !== newDate.toDateString()
      ) {
        updateData.scheduled_start = formatDateForBackend(scheduledStart);
      }
    }
    if (scheduledEnd) {
      const oldDate = new Date(group.scheduled_end || "");
      const newDate = scheduledEnd;
      if (
        !group.scheduled_end ||
        oldDate.toDateString() !== newDate.toDateString()
      ) {
        updateData.scheduled_end = formatDateForBackend(scheduledEnd);
      }
    }
    if (
      startTime !== (formatDateToHHMM(new Date(group.scheduled_start!)) || "")
    )
      updateData.embarked_at = startTime;
    if (finishTime !== (formatDateToHHMM(new Date(group.scheduled_end!)) || ""))
      updateData.finish_time = finishTime;

    // If no changes were made, alert the user and exit.
    if (Object.keys(updateData).length === 0) {
      Alert.alert("No changes made.");
      setEditing(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${group._id}/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            updated_by: mongoId,
            ...updateData,
          }),
        }
      );
      if (response.ok) {
        const updatedGroup = await response.json();
        Alert.alert("Group updated successfully");
        navigation.push("GroupPage", {
          groupId: updatedGroup._id,
          fromCreate: true,
        });
      } else {
        const errorData = await response.json();
        Alert.alert("Failed to update group", JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error updating group:", error);
      Alert.alert("Error updating group");
    } finally {
      setEditing(false);
    }
  };

  // Handler for "Not Now" button in modal – navigate to Group Page.
  const handleModalOk = () => {
    setShowCreatedModal(false);
    if (group) {
      navigation.push("GroupPage", {
        groupId: group._id,
        fromCreate: true,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <ScrollView scrollEnabled={scrollEnabled}>
        <Text className="text-2xl font-bold mb-4">Edit Group</Text>
        <LabeledTextInput
          label="Group Name"
          placeholder="Enter group name"
          value={groupName}
          onChangeText={setGroupName}
        />
        <LabeledTextInput
          label="Description"
          placeholder="Enter group description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        <TripSelectorField
          label="Select Trip"
          selectedTrip={selectedTrip}
          onSelectTrip={setSelectedTrip}
        />
        {/* === Meeting Point Selector === */}
        <View className="mt-2">
          {/* === Toggle / Set Location Button === */}
          <TouchableOpacity
            onPress={() => setShowMapSearch((v) => !v)}
            activeOpacity={0.7}
            className={`rounded-xl py-1 items-center shadow-md ${showMapSearch ? "bg-green-600" : "bg-blue-600"}`}
          >
            <Text className="text-white text-lg font-bold">
              {showMapSearch
                ? "Set Meeting Point"
                : meetingPointLocation
                  ? "Change Meeting Point"
                  : "Set Meeting Point"}
            </Text>
          </TouchableOpacity>

          {/* === Address Display === */}
          {meetingPointLocation && !showMapSearch && (
            <View className=" bg-white rounded-lg p-4 shadow-md flex-row items-start">
              <View className="flex-1">
                <Text className="text-blue-600 font-semibold uppercase text-xs">
                  Meeting Point
                </Text>
                <Text className="text-gray-800 font-medium text-sm mt-1">
                  {meetingPointLocation}
                </Text>
              </View>
            </View>
          )}

          {/* === Map Picker === */}
          {showMapSearch && (
            <MapSearch
              initialLocation={meetingPointCoordinates || userLocation}
              userLocation={userLocationState || userLocation || undefined}
              onMapTouchStart={() => setScrollEnabled(false)}
              onMapTouchEnd={() => setScrollEnabled(true)}
              onLocationSelect={handleLocationSelect}
            />
          )}
        </View>
        <View className="flex-row justify-between">
          <MaxMembersField value={maxMembers} onChangeText={setMaxMembers} />
          <PrivacyField privacy={privacy} setPrivacy={setPrivacy} />
        </View>
        <DifficultyField
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
        <DateRangePickerField
          startDate={scheduledStart}
          endDate={scheduledEnd}
          onStartDateChange={setScheduledStart}
          onEndDateChange={setScheduledEnd}
        />

        <TimeFields
          startTime={startTime}
          setStartTime={setStartTime}
          finishTime={finishTime}
          setFinishTime={setFinishTime}
          showStartPicker={showStartTimePicker}
          setShowStartPicker={setShowStartTimePicker}
          showFinishPicker={showEndTimePicker}
          setShowFinishPicker={setShowEndTimePicker}
        />
        <TouchableOpacity
          onPress={updateHandle}
          className="bg-blue-500 px-4 py-3 rounded"
          disabled={editing}
        >
          <Text className="text-white text-center font-semibold">
            {editing ? "Editing..." : "Update Group"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {showCreatedModal && (
        <GroupCreatedModal
          visible={showCreatedModal}
          onOk={handleModalOk}
          group={group}
          navigation={navigation}
        />
      )}
    </SafeAreaView>
  );
};

export default EditGroupPage;
