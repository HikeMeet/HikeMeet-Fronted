import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import tw from "twrnc";

interface FriendActionButtonProps {
  status: string; // 'accepted', 'request_sent', 'request_received', 'blocked', or "none"
  currentUserId: string;
  targetUserId: string;
  onStatusChange?: (newStatus: string) => void;
}

const FriendActionButton: React.FC<FriendActionButtonProps> = ({
  status,
  currentUserId,
  targetUserId,
  onStatusChange,
}) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  // Update local status if prop changes.
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  // Determine API endpoint, label, and style based on current status.
  const getEndpointAndStyle = () => {
    switch (currentStatus) {
      case "accepted":
        return {
          endpoint: "/remove",
          label: "Remove Friend",
          color: "bg-red-500",
        };
      case "request_sent":
        return {
          endpoint: "/cancel-request",
          label: "Cancel Request",
          color: "bg-yellow-500",
        };
      case "request_received":
        return {
          endpoint: "/accept-request",
          label: "Accept Request",
          color: "bg-green-500",
        };
      case "blocked":
        return {
          endpoint: "/unblock",
          label: "Unblock User",
          color: "bg-gray-500",
        };
      default:
        return {
          endpoint: "/send-request",
          label: "Send Request",
          color: "bg-blue-500",
        };
    }
  };

  const { endpoint, label, color } = getEndpointAndStyle();

  const handlePress = async () => {
    try {
      // Send API request.
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/friend${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentUserId, targetUserId }),
        }
      );
      const data = await response.json();
      console.log("Response:", data);
      // If the API call is successful, update the status.
      let newStatus = currentStatus;
      if (currentStatus === "none") {
        newStatus = "request_sent";
      } else if (currentStatus === "request_sent") {
        newStatus = "none";
      } else if (currentStatus === "request_received") {
        newStatus = "accepted";
      } else if (currentStatus === "accepted") {
        newStatus = "none";
      } else if (currentStatus === "blocked") {
        newStatus = "none";
      }
      setCurrentStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error("Error in friend action:", error);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={tw`${color} p-4 rounded-lg`}>
      <Text style={tw`text-white text-center`}>{label}</Text>
    </TouchableOpacity>
  );
};

export default FriendActionButton;
