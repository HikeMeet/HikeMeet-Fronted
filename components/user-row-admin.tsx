import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
} from "react-native";
import { MongoUser } from "../interfaces/user-interface";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { deleteFirebaseUser } from "./requests/admin-delete-user";
import tw from "twrnc";

interface UserRowProps {
  user: MongoUser;
  onUserDeleted: (mongoId: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onUserDeleted }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  return (
    <View style={tw`flex-row items-center bg-white p-4 rounded-lg mb-2 shadow`}>
      {/* User Picture */}
      <Image
        source={{
          uri: user.profile_picture || "https://via.placeholder.com/150",
        }}
        style={tw`w-12 h-12 rounded-full mr-4`}
      />

      {/* User Info */}
      <View style={tw`flex-1`}>
        <Text style={tw`text-lg font-bold`}>
          {`${user.first_name} ${user.last_name}`}
        </Text>
        <Text style={tw`text-sm text-gray-500`}>@{user.username}</Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={tw`bg-red-500 p-2 rounded-lg`}
      >
        <Text style={tw`text-white text-sm`}>Delete</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
        >
          <View style={tw`bg-white rounded-lg p-6 w-3/4`}>
            <Text style={tw`text-lg font-bold mb-4`}>
              Are you sure you want to remove {user.first_name} from the
              platform?
            </Text>
            <View style={tw`flex-row justify-between`}>
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
              <Button title="Delete" color="red" onPress={handleDelete} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserRow;
