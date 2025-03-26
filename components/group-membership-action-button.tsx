import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import { MongoUser } from "../interfaces/user-interface";
import { Group } from "../interfaces/group-interface";
import { useAuth } from "../contexts/auth-context";
import ConfirmationModal from "./confirmation-modal";

type StatusType = "none" | "invited" | "member" | "requested";

interface GroupActionButtonProps {
  friend: MongoUser;
  group: Group;
}

const GroupActionButton: React.FC<GroupActionButtonProps> = ({
  friend,
  group,
}) => {
  const { mongoId } = useAuth();
  const groupId = group._id;
  const [status, setStatus] = useState<StatusType>("none");
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [showDeclineConfirmModal, setShowDeclineConfirmModal] = useState(false);
  // Determine initial status based on group.members and group.pending
  useEffect(() => {
    const isMember = group.members.some((m) => m.user === friend._id);
    if (isMember) {
      setStatus("member");
      return;
    }
    const pendingEntry = group.pending.find((p) => p.user === friend._id);
    if (pendingEntry) {
      if (
        pendingEntry.origin === "invite" &&
        pendingEntry.status === "pending"
      ) {
        setStatus("invited");
      } else if (
        pendingEntry.origin === "request" &&
        pendingEntry.status === "pending"
      ) {
        setStatus("requested");
      }
      return;
    }
    setStatus("none");
  }, [group, friend._id]);

  // Action handlers:
  const handleInvite = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}/invite/${friend._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_triggered: mongoId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to invite friend");
        return;
      }
      Alert.alert("Success", "Invitation sent!");
      setStatus("invited");
    } catch (error) {
      console.error("Error inviting friend:", error);
      Alert.alert("Error", "Failed to invite friend");
    }
  };

  const handleCancelInvite = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}/cancel-invite/${friend._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cancelled_by: mongoId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to cancel invitation");
        return;
      }
      Alert.alert("Success", "Invitation cancelled!");
      setStatus("none");
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      Alert.alert("Error", "Failed to cancel invitation");
    }
  };

  const handleRemoveMember = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}/remove-member/${friend._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ removed_by: mongoId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to remove member");
        return;
      }
      Alert.alert("Success", "Member removed!");
      setStatus("none");
    } catch (error) {
      console.error("Error removing member:", error);
      Alert.alert("Error", "Failed to remove member");
    } finally {
      setShowRemoveConfirmModal(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}/approve-join/${friend._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_id: mongoId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.error || "Failed to accept join request"
        );
        return;
      }
      Alert.alert("Success", "Join request approved!");
      setStatus("member");
    } catch (error) {
      console.error("Error accepting join request:", error);
      Alert.alert("Error", "Failed to accept join request");
    }
  };

  const handleDeclineRequest = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}/cancel-join/${friend._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cancelled_by: mongoId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.error || "Failed to decline join request"
        );
        return;
      }
      Alert.alert("Success", "Join request declined!");
      setStatus("none");
    } catch (error) {
      console.error("Error declining join request:", error);
      Alert.alert("Error", "Failed to decline join request");
    } finally {
      setShowDeclineConfirmModal(false);
    }
  };

  // Render button(s) based on current status
  const renderButton = () => {
    switch (status) {
      case "none":
        return (
          <TouchableOpacity
            onPress={handleInvite}
            style={tw`bg-blue-500 px-3 py-2 rounded`}
          >
            <Text style={tw`text-white text-sm`}>Invite</Text>
          </TouchableOpacity>
        );
      case "invited":
        return (
          <TouchableOpacity
            onPress={handleCancelInvite}
            style={tw`bg-orange-500 px-3 py-2 rounded`}
          >
            <Text style={tw`text-white text-sm`}>Cancel Invite</Text>
          </TouchableOpacity>
        );
      case "member":
        return (
          <TouchableOpacity
            onPress={() => setShowRemoveConfirmModal(true)}
            style={tw`bg-red-500 px-3 py-2 rounded`}
          >
            <Text style={tw`text-white text-sm`}>Remove</Text>
          </TouchableOpacity>
        );
      case "requested":
        return (
          <View style={tw`flex-row space-x-2`}>
            <TouchableOpacity
              onPress={handleAcceptRequest}
              style={tw`bg-green-500 px-3 py-2 rounded`}
            >
              <Text style={tw`text-white text-sm`}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeclineConfirmModal(true)}
              style={tw`bg-red-500 px-3 py-2 rounded`}
            >
              <Text style={tw`text-white text-sm`}>Decline</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderButton()}
      {showRemoveConfirmModal && (
        <ConfirmationModal
          visible={showRemoveConfirmModal}
          message={`Are you sure you want to remove ${friend.username} from this group?`}
          onConfirm={handleRemoveMember}
          onCancel={() => setShowRemoveConfirmModal(false)}
        />
      )}
      {showDeclineConfirmModal && (
        <ConfirmationModal
          visible={showDeclineConfirmModal}
          message={`Are you sure you want to decline ${friend.username} request?`}
          onConfirm={handleDeclineRequest}
          onCancel={() => setShowDeclineConfirmModal(false)}
        />
      )}
    </>
  );
};

export default GroupActionButton;
