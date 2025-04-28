import { useState, useEffect } from "react";
import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Group } from "../../../interfaces/group-interface";
import { useAuth } from "../../../contexts/auth-context";
import ConfirmationModal from "../../../components/confirmation-modal";

type JoinStatus = "none" | "member" | "requested" | "invited";

interface JoinGroupActionButtonProps {
  group: Group;
  navigation: any;
  isInGroupPage: boolean;
  onAction?: (updatedGroup?: Group) => void;
}

const JoinGroupActionButton: React.FC<JoinGroupActionButtonProps> = ({
  group,
  navigation,
  isInGroupPage,
  onAction = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const [joinStatus, setJoinStatus] = useState<JoinStatus>("none");
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeclineConfirmModal, setShowDeclineConfirmModal] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const { mongoId } = useAuth();
  // Compute initial join status (simplified)
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

  // Actual deletion function that calls the endpoint
  const performDeleteGroup = async () => {
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
        Alert.alert("Error", errorData.error || "Failed to delete group");
        return;
      }
      setJoinStatus("none");
      navigation.navigate("Tabs", { screen: "Groups" });
    } catch (error) {
      console.error("Error deleting group:", error);
      Alert.alert("Error", "Failed to delete group");
    } finally {
      setLoading(false);
      setShowDeleteConfirmModal(false);
    }
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
      let updatedGroup = { ...group };
      if (group.privacy === "public") {
        Alert.alert("Success", "You have joined the group!");
        setJoinStatus("member");
        // Add the current user to the members list.
        updatedGroup.members = [...(group.members as any), { user: mongoId }];
      } else {
        Alert.alert("Success", "Join request sent!");
        setJoinStatus("requested");
        // Add a pending request.
        updatedGroup.pending = [
          ...(group.pending as any),
          { user: mongoId, origin: "request", status: "pending" },
        ];
      }
      onAction(updatedGroup);
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
      let updatedGroup = { ...group };
      // Remove the current user from the members list.
      updatedGroup.members = group.members.filter((m) => m.user !== mongoId);
      onAction(updatedGroup);
    } catch (error) {
      console.error("Error leaving group:", error);
      Alert.alert("Error", "Failed to leave group");
    } finally {
      setLoading(false);
      setShowLeaveConfirmModal(false);
    }
  };

  // Handler for accepting an invitation
  const handleAcceptInvite = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${group._id}/accept-invite/${mongoId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to accept invite");
        return;
      }
      Alert.alert("Success", "Invitation accepted!");
      setJoinStatus("member");
      let updatedGroup = { ...group };
      // Add current user to members and remove any pending invite entries.
      updatedGroup.members = [...(group.members as any), { user: mongoId }];
      updatedGroup.pending = group.pending.filter((p) => p.user !== mongoId);
      onAction(updatedGroup);
    } catch (error) {
      console.error("Error accepting invite:", error);
      Alert.alert("Error", "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  // Handler for declining an invitation (with confirmation)
  const handleDeclineInvite = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${group._id}/cancel-invite/${mongoId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cancelled_by: mongoId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to decline invite");
        return;
      }
      Alert.alert("Success", "Invitation declined.");
      setJoinStatus("none");
      let updatedGroup = { ...group };
      // Remove the pending invite.
      updatedGroup.pending = group.pending.filter((p) => p.user !== mongoId);
      onAction(updatedGroup);
    } catch (error) {
      console.error("Error declining invite:", error);
      Alert.alert("Error", "Failed to decline invite");
    } finally {
      setLoading(false);
      setShowDeclineConfirmModal(false);
    }
  };

  // Render UI based on joinStatus.
  const renderButton = () => {
    // If current user is the group creator, render delete button (only if on group page)
    if (group.created_by === mongoId) {
      if (!isInGroupPage) {
        return null;
      } else {
        return (
          <TouchableOpacity
            onPress={() => setShowDeleteConfirmModal(true)}
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
            onPress={() => setShowLeaveConfirmModal(true)}
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
            onPress={handleJoinGroup} // Ideally, use a cancel request endpoint
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
              onPress={handleAcceptInvite}
              className="bg-green-500 px-4 py-2 rounded"
            >
              <Text className="text-white text-sm font-semibold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeclineConfirmModal(true)}
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

  return (
    <View>
      {renderButton()}
      {showDeleteConfirmModal && (
        <ConfirmationModal
          visible={showDeleteConfirmModal}
          message="Are you sure you want to delete this group?"
          onConfirm={performDeleteGroup}
          onCancel={() => setShowDeleteConfirmModal(false)}
        />
      )}
      {showDeclineConfirmModal && (
        <ConfirmationModal
          visible={showDeclineConfirmModal}
          message="Are you sure you want to decline the invitation?"
          onConfirm={handleDeclineInvite}
          onCancel={() => setShowDeclineConfirmModal(false)}
        />
      )}
      {showLeaveConfirmModal && (
        <ConfirmationModal
          visible={showLeaveConfirmModal}
          message="Are you sure you want to leave the group?"
          onConfirm={handleLeaveGroup}
          onCancel={() => setShowLeaveConfirmModal(false)}
        />
      )}
    </View>
  );
};

export default JoinGroupActionButton;
