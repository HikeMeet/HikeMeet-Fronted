import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import { useNavigation } from "@react-navigation/native";
import { Group } from "../interfaces/group-interface";
import { useAuth } from "../contexts/auth-context";

type JoinStatus = "none" | "member" | "requested" | "invited";

interface JoinGroupActionButtonProps {
  group: Group;
  navigation: any;
  isInGroupPage: boolean;
}

const JoinGroupActionButton: React.FC<JoinGroupActionButtonProps> = ({
  group,
  navigation,
  isInGroupPage,
}) => {
  const [loading, setLoading] = useState(false);
  const [joinStatus, setJoinStatus] = useState<JoinStatus>("none");
  const { mongoId } = useAuth();

  // Compute initial join status (simplified example)
  useEffect(() => {
    if (group.members.some((m) => m.user === mongoId)) {
      setJoinStatus("member");
    } else {
      const pendingInvite = group.pending.find(
        (p) =>
          p.user === mongoId && p.origin === "invite" && p.status === "pending"
      );
      const pendingRequest = group.pending.find(
        (p) =>
          p.user === mongoId && p.origin === "request" && p.status === "pending"
      );
      if (pendingInvite) {
        setJoinStatus("invited");
      } else if (pendingRequest) {
        setJoinStatus("requested");
      } else {
        setJoinStatus("none");
      }
    }
  }, [group, mongoId]);

  // Handler for deleting the group (if creator)
  const handleDeleteGroup = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(
                `${process.env.EXPO_LOCAL_SERVER}/api/group/${group._id}/delete`,
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ deleted_by: mongoId }),
                }
              );
              if (!response.ok) {
                const errorData = await response.json();
                Alert.alert(
                  "Error",
                  errorData.error || "Failed to delete group"
                );
                return;
              }
              Alert.alert("Success", "Group deleted successfully");
              navigation.navigate("Tabs", { screen: "Groups" });
            } catch (error) {
              console.error("Error deleting group:", error);
              Alert.alert("Error", "Failed to delete group");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handler for joining the group (for non-creators)
  const handleJoinGroup = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${group._id}/join/${mongoId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to join group");
        return;
      }
      if (group.privacy === "public") {
        Alert.alert("Success", "You have joined the group!");
        setJoinStatus("member");
      } else {
        Alert.alert("Success", "Join request sent!");
        setJoinStatus("requested");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      Alert.alert("Error", "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  // Handler for leaving the group
  const handleLeaveGroup = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${group._id}/remove-member/${mongoId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ removed_by: mongoId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to leave group");
        return;
      }
      Alert.alert("Success", "You have left the group.");
      setJoinStatus("none");
    } catch (error) {
      console.error("Error leaving group:", error);
      Alert.alert("Error", "Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  // Render the appropriate button based on status
  const renderButton = () => {
    // If current user is the group creator
    if (group.created_by === mongoId) {
      // If on the group page, don't show any button
      if (!isInGroupPage) {
        return null;
      } else {
        return (
          <TouchableOpacity
            onPress={handleDeleteGroup}
            className="bg-red-500 px-4 py-2 rounded"
            disabled={loading}
          >
            <Text className="text-white text-sm font-semibold">
              {loading ? "Deleting..." : "Delete Group"}
            </Text>
          </TouchableOpacity>
        );
      }
    }

    // For non-creators, render join/leave logic.
    if (loading) {
      return <Text className="text-sm text-gray-600">Please wait...</Text>;
    }
    switch (joinStatus) {
      case "none":
        if (group.members.length >= group.max_members) {
          return (
            <TouchableOpacity className="bg-gray-500 px-4 py-2 rounded opacity-50">
              <Text className="text-white text-sm font-semibold">
                Group is full
              </Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity
            onPress={handleJoinGroup}
            className="bg-blue-500 px-4 py-2 rounded"
          >
            <Text className="text-white text-sm font-semibold">
              {group.privacy === "public" ? "Join Group" : "Request to Join"}
            </Text>
          </TouchableOpacity>
        );
      case "member":
        return (
          <TouchableOpacity
            onPress={handleLeaveGroup}
            className="bg-red-500 px-4 py-2 rounded"
          >
            <Text className="text-white text-sm font-semibold">
              Leave Group
            </Text>
          </TouchableOpacity>
        );
      case "requested":
        return (
          <TouchableOpacity
            onPress={handleJoinGroup} // In a real app, you might have a cancel request endpoint here.
            className="bg-orange-500 px-4 py-2 rounded"
          >
            <Text className="text-white text-sm font-semibold">
              Cancel Request
            </Text>
          </TouchableOpacity>
        );
      case "invited":
        return (
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={handleJoinGroup} // Accept invite endpoint
              className="bg-green-500 px-4 py-2 rounded"
            >
              <Text className="text-white text-sm font-semibold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleJoinGroup} // Decline invite endpoint (for demo, using same handler)
              className="bg-red-500 px-4 py-2 rounded"
            >
              <Text className="text-white text-sm font-semibold">Decline</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return <View>{renderButton()}</View>;
};

export default JoinGroupActionButton;
