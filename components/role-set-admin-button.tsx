import { useState, useEffect } from "react";
import React from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import ConfirmationModal from "./confirmation-modal";

interface RoleToggleButtonProps {
  user: {
    _id: string;
    role: "user" | "admin";
  };
  onUpdate: (updatedUser: any) => void;
}

const RoleToggleButton: React.FC<RoleToggleButtonProps> = ({
  user,
  onUpdate,
}) => {
  const [currentRole, setCurrentRole] = useState<"user" | "admin">(user.role);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Sync local state if parent prop changes
  useEffect(() => {
    setCurrentRole(user.role);
  }, [user.role]);

  const handleToggle = async () => {
    // Optimistically update the role
    const prevRole = currentRole;
    const newRole = currentRole === "user" ? "admin" : "user";
    setCurrentRole(newRole);
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/${user._id}/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update user role");
      }
      const updatedUser = await response.json();
      onUpdate(updatedUser);
    } catch (error: any) {
      // Revert the optimistic update if error occurs
      setCurrentRole(prevRole);
      Alert.alert("Error", error.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        disabled={loading}
        className="bg-blue-500 p-3 rounded-lg"
      >
        <Text className="text-white text-center font-bold">
          {currentRole === "user" ? "To Admin" : "To User"}
        </Text>
      </TouchableOpacity>

      <ConfirmationModal
        visible={isModalVisible}
        message={
          currentRole === "user"
            ? "Are you sure you want to promote this user to admin?"
            : "Are you sure you want to demote this user to regular user?"
        }
        onConfirm={() => {
          setIsModalVisible(false);
          handleToggle();
        }}
        onCancel={() => setIsModalVisible(false)}
      />
    </>
  );
};

export default RoleToggleButton;
