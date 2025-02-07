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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteMongoUser } from "./requests/delete-user";

interface UserRowProps {
  user: MongoUser;
}
// add firebase admin!
const UserRow: React.FC<UserRowProps> = ({ user }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDelete = async () => {
    setIsModalVisible(false);
    try {
      const fireUser = FIREBASE_AUTH.currentUser;
      if (!fireUser) throw new Error("No user is signed in");

      // Delete Firebase account
      await fireUser.delete();
      await AsyncStorage.removeItem("user");

      // Delete user from MongoDB
      if (!user._id) {
        console.error("Error: User ID is null or undefined.");
        throw new Error("User ID is null or undefined.");
      }

      const result = await deleteMongoUser(user._id);
      console.log("Delete Result:", result);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete user.");
    }
  };

  return (
    <View className="flex-row items-center bg-white p-4 rounded-lg mb-2 shadow">
      {/* User Picture */}
      <Image
        source={{
          uri: user.profile_picture || "https://via.placeholder.com/150",
        }}
        className="w-12 h-12 rounded-full mr-4"
      />

      {/* User Info */}
      <View className="flex-1">
        <Text className="text-lg font-bold">{`${user.first_name} ${user.last_name}`}</Text>
        <Text className="text-sm text-gray-500">@{user.username}</Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="bg-red-500 p-2 rounded-lg"
      >
        <Text className="text-white text-sm">Delete</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-6 w-3/4">
            <Text className="text-lg font-bold mb-4">
              Are you sure you want to remove {user.first_name} from the
              platform?
            </Text>
            <View className="flex-row justify-between">
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
