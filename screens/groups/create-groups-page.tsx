// CreateGroupPage.tsx
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GroupCreatedModal from "../../components/post-group-creatonal";
import { useAuth } from "../../contexts/auth-context";
import { Group } from "../../interfaces/group-interface";
import {
  DateRangePickerField,
  DifficultyField,
  EmbarkedAtField,
  LabeledTextInput,
  MaxMembersField,
  PrivacyField,
  TripSelectorField,
} from "./components/edit-page-components";

const CreateGroupPage: React.FC<any> = ({ navigation }) => {
  // Form states
  const [groupName, setGroupName] = useState<string>("");
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [maxMembers, setMaxMembers] = useState<string>("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [scheduledStart, setScheduledStart] = useState<Date | null>(null);
  const [scheduledEnd, setScheduledEnd] = useState<Date | null>(null);
  const [embarkedAt, setEmbarkedAt] = useState<string>("");
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [showCreatedModal, setShowCreatedModal] = useState<boolean>(false);

  const { mongoId } = useAuth(); // current user's data

  // Helper function to format date for backend (ISO string)
  const formatDateForBackend = (date: Date) => date.toISOString();

  // Handler for creating group
  const handleCreateGroup = async () => {
    if (!groupName || !selectedTrip || !maxMembers) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    setCreating(true);
    try {
      const payload = {
        name: groupName,
        trip: selectedTrip,
        max_members: Number(maxMembers),
        privacy,
        description,
        difficulty,
        scheduled_start: scheduledStart
          ? formatDateForBackend(scheduledStart)
          : null,
        scheduled_end: scheduledEnd ? formatDateForBackend(scheduledEnd) : null,
        embarked_at: embarkedAt,
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
      <ScrollView>
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
        <EmbarkedAtField
          embarkedAt={embarkedAt}
          setEmbarkedAt={setEmbarkedAt}
          showTimePicker={showTimePicker}
          setShowTimePicker={setShowTimePicker}
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
