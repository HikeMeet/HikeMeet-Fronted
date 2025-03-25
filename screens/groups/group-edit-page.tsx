import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TripSelector from "../../components/trip-selector-for-group";
import DateRangePicker from "../../components/schedual-time-group";
import TimePickerPopup from "../../components/time-picker";
import { useAuth } from "../../contexts/auth-context";
import { Group } from "../../interfaces/group-interface";
import GroupCreatedModal from "../../components/post-group-creatonal";

interface EditGroupPageProps {
  navigation: any;
  route: {
    params: {
      group: Group;
    };
  };
}

const EditGroupPage: React.FC<EditGroupPageProps> = ({ navigation, route }) => {
  const { group } = route.params;
  const { mongoId } = useAuth();

  // Initialize states with the group's current data.
  const [groupName, setGroupName] = useState<string>(group.name);
  const [selectedTrip, setSelectedTrip] = useState<string>(group.trip);
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
  const [embarkedAt, setEmbarkedAt] = useState<string>(group.embarked_at || "");
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [showCreatedModal, setShowCreatedModal] = useState<boolean>(false);

  // Helper function to format date for backend (ISO string)
  const formatDateForBackend = (date: Date) => date.toISOString();

  // updateHandle constructs the update JSON with only changed fields and sends the update request.
  const updateHandle = async () => {
    setEditing(true);
    const updateData: any = {};

    if (groupName !== group.name) updateData.name = groupName;
    if (selectedTrip !== group.trip) updateData.trip = selectedTrip;
    if (maxMembers !== group.max_members.toString()) {
      updateData.max_members = parseInt(maxMembers, 10);
    }
    if (privacy !== group.privacy) updateData.privacy = privacy;
    if (description !== (group.description || ""))
      updateData.description = description;
    if (difficulty !== (group.difficulty || ""))
      updateData.difficulty = difficulty;

    if (scheduledStart) {
      if (
        !group.scheduled_start ||
        new Date(group.scheduled_start).toISOString() !==
          scheduledStart.toISOString()
      ) {
        updateData.scheduled_start = formatDateForBackend(scheduledStart);
      }
    }
    if (scheduledEnd) {
      if (
        !group.scheduled_end ||
        new Date(group.scheduled_end).toISOString() !==
          scheduledEnd.toISOString()
      ) {
        updateData.scheduled_end = formatDateForBackend(scheduledEnd);
      }
    }
    if (embarkedAt !== (group.embarked_at || ""))
      updateData.embarked_at = embarkedAt;

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
        navigation.navigate("GroupPage", {
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
      navigation.navigate("GroupPage", {
        groupId: group._id,
        fromCreate: true,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <ScrollView>
        <Text className="text-2xl font-bold mb-4">Edit Group</Text>

        {/* Group Name */}
        <View className="mb-4">
          <Text className="mb-2">Group Name</Text>
          <TextInput
            placeholder="Enter group name"
            className="bg-gray-100 p-3 rounded"
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="mb-2">Description</Text>
          <TextInput
            placeholder="Enter group description"
            className="bg-gray-100 p-3 rounded"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Trip Selector */}
        <View className="mb-4">
          <Text className="mb-2">Select Trip</Text>
          <TripSelector
            onSelectTrip={(tripId) => setSelectedTrip(tripId)}
            selectedTripId={selectedTrip}
          />
        </View>

        {/* Maximum Members & Privacy */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="mb-2">Maximum Members</Text>
            <TextInput
              placeholder="Max"
              maxLength={2}
              keyboardType="numeric"
              value={maxMembers}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                if (numericText && parseInt(numericText, 10) > 99) {
                  setMaxMembers("99");
                } else {
                  setMaxMembers(numericText);
                }
              }}
              className="bg-gray-100 p-3 rounded w-16"
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="mb-2">Privacy</Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setPrivacy("public")}
                className={`px-4 py-2 mr-2 rounded ${
                  privacy === "public" ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`${
                    privacy === "public" ? "text-white" : "text-black"
                  } font-semibold`}
                >
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPrivacy("private")}
                className={`px-4 py-2 rounded ${
                  privacy === "private" ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`${
                    privacy === "private" ? "text-white" : "text-black"
                  } font-semibold`}
                >
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Difficulty */}
        <View className="mb-4">
          <Text className="mb-2">Difficulty</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              onPress={() => setDifficulty("beginner")}
              className={`w-[48%] px-3 py-2 mb-2 rounded ${
                difficulty === "beginner" ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  difficulty === "beginner" ? "text-white" : "text-black"
                }`}
              >
                Beginner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDifficulty("intermediate")}
              className={`w-[48%] px-3 py-2 mb-2 rounded ${
                difficulty === "intermediate" ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  difficulty === "intermediate" ? "text-white" : "text-black"
                }`}
              >
                Intermediate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDifficulty("advanced")}
              className={`w-[48%] px-3 py-2 mb-2 rounded ${
                difficulty === "advanced" ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  difficulty === "advanced" ? "text-white" : "text-black"
                }`}
              >
                Advanced
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDifficulty("hardcore")}
              className={`w-[48%] px-3 py-2 mb-2 rounded ${
                difficulty === "hardcore" ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  difficulty === "hardcore" ? "text-white" : "text-black"
                }`}
              >
                Hardcore
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Range Picker for Scheduled Start & End */}
        <View className="mb-4">
          <DateRangePicker
            startDate={scheduledStart}
            endDate={scheduledEnd}
            onStartDateChange={setScheduledStart}
            onEndDateChange={setScheduledEnd}
          />
        </View>

        {/* Embarked At */}
        <View className="mb-4">
          <Text className="mb-2">Embarked At (HH:MM)</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="bg-gray-100 p-3 rounded"
          >
            <Text className="text-center">
              {embarkedAt ? embarkedAt : "Select time (HH:MM)"}
            </Text>
          </TouchableOpacity>
        </View>
        {showTimePicker && (
          <TimePickerPopup
            visible={showTimePicker}
            initialTime={embarkedAt}
            onConfirm={(time: string) => {
              console.log("Selected time:", time);
              setEmbarkedAt(time);
              setShowTimePicker(false);
            }}
            onCancel={() => setShowTimePicker(false)}
          />
        )}

        {/* Update Button */}
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
      {/* Show modal after group creation/update */}
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
