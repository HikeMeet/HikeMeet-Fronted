import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { FIREBASE_AUTH } from "../firebaseconfig";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/auth-context";

interface ConfirmPopupProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  navigation: any;
}

const DeleteConfirmPopup: React.FC<ConfirmPopupProps> = ({
  visible,
  message,
  onConfirm,
  onCancel,
  navigation,
}) => {
  const [password, setPassword] = useState("");
  const { mongoId } = useAuth(); // Get the mongoId from useAuth
  const deleteMongoUser = async () => {
    try {
      if (!mongoId) {
        throw new Error(`User ID ${mongoId} is not available.`);
      }
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/${mongoId}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete user:", errorData);
        throw new Error(errorData.error || "Failed to delete user");
      }

      const result = await response.json();
      console.log("User deleted successfully:", result);
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const handleDeleteAccount = async (): Promise<boolean> => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) throw new Error("No user is signed in");

      const credential = EmailAuthProvider.credential(user.email!, password);

      // Re-authenticate the user
      await reauthenticateWithCredential(user, credential);

      // Delete the account
      await user.delete();
      await AsyncStorage.removeItem("user");
      try {
        await deleteMongoUser();
        console.log("User deletion successful");
      } catch (error: any) {
        console.error("Error during deletion:", error.message);
      }

      return true; // Indicate success
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "The password you entered is incorrect.");
      } else {
        Alert.alert("Error", error.message);
      }
      return false; // Indicate failure
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 bg-white rounded-lg p-6">
          <Text className="text-lg font-medium text-center mb-4">
            {message}
          </Text>
          <Text className="text-base text-center mb-4">
            For security purposes, please enter your current password to confirm
            account deletion.
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-2 mb-4"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="flex-1 mr-2 bg-red-500 py-2 rounded-lg items-center"
              onPress={onCancel}
            >
              <Text className="text-white text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 ml-2 bg-green-500 py-2 rounded-lg items-center"
              onPress={async () => {
                const isSuccess = await handleDeleteAccount();
                if (isSuccess) {
                  onConfirm();
                }
              }}
            >
              <Text className="text-white text-base">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmPopup;
