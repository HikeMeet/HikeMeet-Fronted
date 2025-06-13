// CreateGroupPage.tsx
import { useEffect, useState } from "react";
import React from "react";
import { ScrollView, TouchableOpacity, Text, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GroupCreatedModal from "../../components/post-group-creatonal";
import * as Location from "expo-location";
import { useAuth } from "../../contexts/auth-context";
import { Group } from "../../interfaces/group-interface";
import {
  DateRangePickerField,
  DifficultyField,
  LabeledTextInput,
  MaxMembersField,
  PrivacyField,
  TimeFields,
  TripSelectorField,
} from "./components/edit-page-components";
import MapSearch from "../../components/map-search-creaete-trip";
import { Trip } from "../../interfaces/trip-interface";

const CreateGroupPage: React.FC<any> = ({ navigation, route }) => {
  const { trip } = route.params || {};
  // Form states
  const [groupName, setGroupName] = useState<string>("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [maxMembers, setMaxMembers] = useState<string>("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [scheduledStart, setScheduledStart] = useState<Date | null>(null);
  const [scheduledEnd, setScheduledEnd] = useState<Date | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [showCreatedModal, setShowCreatedModal] = useState<boolean>(false);
  const [showStartTimePicker, setShowStartTimePicker] =
    useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>("");
  const [finishTime, setFinishTime] = useState<string>("");
  const [showMapSearch, setShowMapSearch] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [meetingPointLocation, setMeetingPointLocation] = useState<
    string | null
  >(null);
  const [meetingPointCoordinates, setMeetingPointCoordinates] = useState<
    [number, number] | null
  >(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const { mongoId } = useAuth(); // current user's data

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

  // Get user's current location.
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

  useEffect(() => {
    if (trip) {
      setSelectedTrip(trip._id);
      setMeetingPointLocation(trip.location.address);
      setMeetingPointCoordinates([
        trip.location.coordinates[0],
        trip.location.coordinates[1],
      ]);
    }
  }, [trip]);
  // Handler for creating group
  const handleCreateGroup = async () => {
    if (!groupName || !selectedTrip || !maxMembers) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    setCreating(true);
    try {
      const finalMeetingPointLocation =
        meetingPointLocation ?? selectedTrip.location.address;
      const finalMeetingPointCoordinates = meetingPointCoordinates ?? [
        selectedTrip.location.coordinates[0],
        selectedTrip.location.coordinates[1],
      ];

      const payload = {
        name: groupName,
        trip: selectedTrip._id,
        max_members: Number(maxMembers),
        privacy,
        description,
        difficulty,
        scheduled_start: scheduledStart
          ? formatDateForBackend(scheduledStart)
          : null,
        scheduled_end: scheduledEnd ? formatDateForBackend(scheduledEnd) : null,
        embarked_at: startTime,
        finish_time: finishTime,
        meeting_point: {
          address: finalMeetingPointLocation,
          coordinates: finalMeetingPointCoordinates,
        },
        created_by: mongoId,
      };
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to create group.");
        return;
      }
      const data = await response.json();
      setGroup(data);
      // Show the modal after successful creation.
      setShowCreatedModal(true);
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Something went wrong while creating the group.");
    } finally {
      setCreating(false);
    }
  };

  // Handler for "Not Now" button in modal – navigate to Group Page
  const handleModalOk = () => {
    setShowCreatedModal(false);
    if (group) {
      navigation.navigate("GroupPage", {
        groupId: group._id,
        fromCreate: true,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <ScrollView scrollEnabled={scrollEnabled}>
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
              userLocation={userLocation || undefined}
              onMapTouchStart={() => setScrollEnabled(false)}
              onMapTouchEnd={() => setScrollEnabled(true)}
              onLocationSelect={handleLocationSelect}
            />
          )}
        </View>

        <View className="flex-row justify-between mt-3">
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
          onPress={handleCreateGroup}
          className="bg-blue-500 px-4 py-3 rounded"
          disabled={creating}
        >
          <Text className="text-white text-center font-semibold">
            {creating ? "Creating..." : "Create Group"}
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

export default CreateGroupPage;
