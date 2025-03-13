import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import tw from "twrnc";
import { useAuth } from "../contexts/auth-context";

interface FriendActionButtonProps {
  status: string; // 'accepted', 'request_sent', 'request_received', 'blocked', or "none"
  targetUserId: string;
  onStatusChange?: (newStatus: string) => void;
}

const FriendActionButton: React.FC<FriendActionButtonProps> = ({
  status,
  targetUserId,
  onStatusChange,
}) => {
  const { mongoUser, mongoId, setMongoUser } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(status);

  // Update local status if prop changes.
  useEffect(() => {
    const friendStatus = mongoUser?.friends?.find(
      (friend) => String(friend.id) === String(targetUserId)
    )?.status;
    setCurrentStatus(friendStatus || "none"); // fallback if friendStatus is undefined
  }, [mongoUser, targetUserId]);

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
          body: JSON.stringify({ mongoId, targetUserId }),
        }
      );
      const data = await response.json();
      console.log("Response:", data);

      // Determine new status.
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

      // Update local state and invoke callback.
      setCurrentStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      // Update mongoUser in context.
      setMongoUser((prevUser: any) => {
        if (!prevUser) return prevUser;
        // Copy the current friends list.
        let updatedFriends = [...(prevUser.friends || [])];

        // Locate the friend using targetUserId.
        const friendIndex = updatedFriends.findIndex((friend: any) => {
          // friend.id can be an object (with $oid) or a string.
          if (typeof friend.id === "object" && friend.id.$oid) {
            return friend.id.$oid === targetUserId;
          }
          return friend.id === targetUserId;
        });

        if (newStatus === "none") {
          // Remove friend if found.
          if (friendIndex !== -1) {
            updatedFriends.splice(friendIndex, 1);
          }
        } else {
          // Update existing friend entry or add a new one.
          const friendEntry = { status: newStatus, id: targetUserId };
          if (friendIndex !== -1) {
            updatedFriends[friendIndex] = friendEntry;
          } else {
            updatedFriends.push(friendEntry);
          }
        }
        return { ...prevUser, friends: updatedFriends };
      });
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
