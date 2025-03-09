import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../contexts/auth-context";
import { MongoUser } from "../interfaces/user-interface";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { deleteFirebaseUser } from "./requests/admin-delete-user";
import { Ionicons } from "@expo/vector-icons";
import RoleToggleButton from "./role-set-admin-button";
import ConfirmationModal from "./confirmation-modal";

interface UserRowProps {
  user: MongoUser;
  onUserDeleted: (mongoId: string) => void;
  onUserRoleUpdate: (updatedUser: MongoUser) => void;
  navigation: any; // navigation prop from React Navigation
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  onUserDeleted,
  onUserRoleUpdate,
  navigation,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { mongoId } = useAuth(); // Current user's ID

  const handleDelete = async () => {
    setIsModalVisible(false);
    try {
      const fireUser = FIREBASE_AUTH.currentUser;
      if (!fireUser) throw new Error("No user is signed in");

      // Delete user from Firebase & MongoDB using firebase_id
      const result = await deleteFirebaseUser(user.firebase_id);
      console.log("Delete Result:", result);

      // Notify the parent that this user was deleted so it can update the list.
      if (user._id) {
        onUserDeleted(user._id);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete user.");
    }
  };

  // When pressed, navigate accordingly.
  const handlePress = () => {
    if (user._id === mongoId) {
      navigation.navigate("Tabs", { screen: "Profile" });
    } else {
      navigation.navigate("UserProfile", { userId: user._id });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View className="flex-row items-center bg-white p-4 rounded-lg mb-2 shadow">
        {/* User Picture */}
        <Image
          source={{
            uri: user.profile_picture || "https://via.placeholder.com/150",
          }}
          className="w-12 h-12 rounded-full mr-4"
        />

        {/* User Info or options */}
        <View className="flex-1">
          {showOptions ? (
            // Replace name/username with Edit and Role Toggle buttons.
            <View className="flex-row justify">
              <RoleToggleButton
                user={{ _id: user._id, role: user.role as "user" | "admin" }}
                onUpdate={(updatedUser) => {
                  setShowOptions(false);
                  onUserRoleUpdate(updatedUser);
                  Alert.alert(
                    "Success",
                    `User role is now ${updatedUser.role}`
                  );
                }}
              />
              <TouchableOpacity
                className="ml-2 p-3 rounded-lg bg-red-500"
                onPress={() => setIsModalVisible(true)}
              >
                <Text className="text-white text-sm">Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-lg font-bold">
                {`${user.first_name} ${user.last_name}`}
              </Text>
              <Text className="text-sm text-gray-500">@{user.username}</Text>
            </>
          )}
        </View>

        {/* Settings Icon (only for non-current users) */}
        {user._id !== mongoId && (
          <TouchableOpacity
            onPress={() => setShowOptions(!showOptions)}
            className="ml-2"
          >
            <Ionicons name="settings" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Confirmation Modal for Delete using reusable component */}
        <ConfirmationModal
          visible={isModalVisible}
          message={`Are you sure you want to remove ${user.first_name} from the platform?`}
          onConfirm={handleDelete}
          onCancel={() => setIsModalVisible(false)}
        />
      </View>
    </TouchableOpacity>
  );
};

export default UserRow;
