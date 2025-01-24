import React, { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type FriendButtonProps = {
  currentUserId: string; // ID of the logged-in user
  targetUserId: string; // ID of the user to add/remove
  initialStatus: "none" | "pending" | "active"; // Initial active status
  onStatusChange?: (newStatus: "none" | "pending" | "active") => void; // Optional callback for status changes
};

const FriendButton: React.FC<FriendButtonProps> = ({
  currentUserId,
  targetUserId,
  initialStatus,
  onStatusChange,
}) => {
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "active">(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleFriendAction = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let method = "POST";
      const body = JSON.stringify({ userId: currentUserId, friendId: targetUserId });

      if (friendStatus === "none") {
        endpoint = `${process.env.EXPO_LOCAL_SERVER}/api/friends/add-friend`;
      } else if (friendStatus === "pending") {
        endpoint = `${process.env.EXPO_LOCAL_SERVER}/api/friends/cancel-pending`;
      } else if (friendStatus === "active") {
        endpoint = `${process.env.EXPO_LOCAL_SERVER}/api/friends/remove`;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to perform action");
      }

      // Update status locally based on the current state
      if (friendStatus === "none") setFriendStatus("pending");
      else if (friendStatus === "pending") setFriendStatus("none");
      else if (friendStatus === "active") setFriendStatus("none");

      // Trigger optional callback
      onStatusChange?.(friendStatus);
    } catch (error) {
      console.error("Error performing friend action:", error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonProps = () => {
    if (loading) {
      return { text: "Processing...", icon: undefined, bgColor: "bg-gray-400" };
    }
    if (friendStatus === "none") {
      return { text: "Add Friend", icon: "person-add" as const, bgColor: "bg-blue-500" };
    }
    if (friendStatus === "pending") {
      return { text: "Cancel Request", icon: "close-circle" as const, bgColor: "bg-yellow-500" };
    }
    if (friendStatus === "active") {
      return { text: "Remove Friend", icon: "person-remove" as const, bgColor: "bg-red-500" };
    }
    return { text: "Unknown", icon: undefined, bgColor: "bg-gray-500" };
  };
    const { text, icon, bgColor } = getButtonProps();

  return (
    <TouchableOpacity
      className={`px-4 py-2 rounded-lg flex-row items-center justify-center ${bgColor}`}
      onPress={handleFriendAction}
      disabled={loading}
    >
      {icon && <Ionicons name={icon} size={18} color="white" />}
      <Text className="ml-2 text-white font-bold">{text}</Text>
    </TouchableOpacity>
  );
};

export default FriendButton;
