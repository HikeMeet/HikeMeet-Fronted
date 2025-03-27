import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth-context";
import { Group } from "../../interfaces/group-interface";
import GroupCreatedModal from "../../components/post-group-creatonal";
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
  const [startTime, setStartTime] = useState<string>(
    group.scheduled_end ? formatDateToHHMM(new Date(group.scheduled_end)) : ""
  );
  const [finishTime, setFinishTime] = useState<string>(
    group.scheduled_start
      ? formatDateToHHMM(new Date(group.scheduled_start))
      : ""
  );

  const [showStartTimePicker, setShowStartTimePicker] =
    useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
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
