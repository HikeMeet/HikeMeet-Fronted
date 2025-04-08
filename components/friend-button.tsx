import React, { useState, useEffect, useRef } from "react";
import { TouchableOpacity, Text, View, Modal } from "react-native";
import tw from "twrnc";
import { useAuth } from "../contexts/auth-context";

interface FriendActionButtonProps {
  status: string; // "accepted", "request_sent", "request_received", "blocked", or "none"
  targetUserId: string;
  onStatusChange?: (newStatus: string) => void;
}

const FriendActionButton: React.FC<FriendActionButtonProps> = ({
  status,
  targetUserId,
  onStatusChange,
}) => {
  const { mongoUser, mongoId, fetchMongoUser } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showActions, setShowActions] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<any>(null);

  // Update local status based on mongoUser changes.
  useEffect(() => {
    const friendStatus = mongoUser?.friends?.find(
      (friend) => String(friend.id) === String(targetUserId)
    )?.status;
    setCurrentStatus(friendStatus || "none");
  }, [mongoUser, targetUserId]);

  // Determine the primary button's API endpoint, label, and styling.
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

  // Handle primary (short press) action.
  const handlePress = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/friend${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentUserId: mongoId, targetUserId }),
        }
      );
      const data = await response.json();
      console.log("Response:", data);
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
      onStatusChange && onStatusChange(newStatus);
      fetchMongoUser(mongoId!);
    } catch (error) {
      console.error("Error in friend action:", error);
    }
  };

  // Measure the button's position on screen.
  const measureButton = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow(
        (x: any, y: any, width: any, height: any) => {
          setTooltipPosition({ top: y + height, left: x, width });
        }
      );
    }
  };

  // Show extra actions on long press.
  const handleLongPress = () => {
    measureButton();
    setShowActions(true);
  };

  // Extra action handlers.
  const handleBlockUser = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/friend/block`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentUserId: mongoId, targetUserId }),
        }
      );
      const data = await response.json();
      console.log("Block User Response:", data);
      setCurrentStatus("blocked");
      onStatusChange && onStatusChange("blocked");
      setShowActions(false);
      fetchMongoUser(mongoId!);
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleDeclineRequest = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/friend/decline-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentUserId: mongoId, targetUserId }),
        }
      );
      const data = await response.json();
      console.log("Decline Request Response:", data);
      setCurrentStatus("none");
      onStatusChange && onStatusChange("none");
      setShowActions(false);
      fetchMongoUser(mongoId!);
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  return (
    <View style={tw`relative`}>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={tw`${color} py-1 px-2 border border-${color}-400 rounded-full shadow-sm`}
      >
        <Text style={tw`text-white text-center text-sm font-semibold`}>
          {label}
        </Text>
      </TouchableOpacity>

      {showActions && currentStatus !== "blocked" && (
        <Modal
          transparent
          animationType="fade"
          visible={showActions}
          onRequestClose={() => setShowActions(false)}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowActions(false)}
          >
            <View
              style={{
                position: "absolute",
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                // width: tooltipPosition.width,
              }}
            >
              <View
                style={tw`bg-white border border-gray-300 rounded shadow-md p-2`}
              >
                {currentStatus === "request_received" && (
                  <TouchableOpacity
                    onPress={handleDeclineRequest}
                    style={tw`py-1 px-2 bg-yellow-100 rounded`}
                  >
                    <Text style={tw`text-sm text-yellow-600 font-bold`}>
                      Decline Request
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleBlockUser}
                  style={tw`py-1 px-2 bg-red-100 rounded mb-1`}
                >
                  <Text style={tw`text-sm text-red-600 font-bold`}>
                    Block User
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default FriendActionButton;
