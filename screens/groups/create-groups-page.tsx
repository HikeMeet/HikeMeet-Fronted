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
        <Text className="text-2xl font-bold mb-4">Create Group</Text>

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

        {/* Invite Friends to Group Button
        <TouchableOpacity
          onPress={() => setShowInviteModal(true)}
          className="bg-purple-500 px-4 py-2 rounded mt-4 self-start"
        >
          <Text className="text-white text-sm font-semibold">
            Invite Friends to Group
          </Text>
        </TouchableOpacity> */}

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

        {/* Create Button */}
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
      {/* Show modal after group creation */}
      {showCreatedModal && (
        <GroupCreatedModal
          visible={showCreatedModal}
          onOk={handleModalOk}
          group={group} navigation={navigation}        />
      )}
    </SafeAreaView>
  );
};

export default CreateGroupPage;
