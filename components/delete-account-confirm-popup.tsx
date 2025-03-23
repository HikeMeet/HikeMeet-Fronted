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
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/auth-context";
import { deleteMongoUser } from "./requests/delete-user";
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
  const { mongoId } = useAuth(); 

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
        if (!mongoId) {
          console.error("Error: User ID is null or undefined.");
          throw "error";
        }

        const result = await deleteMongoUser(mongoId);
        console.log("Delete Result:", result);
        // Handle success (e.g., update UI)
      } catch (error) {
        console.error("Error deleting user:", error);
        // Handle error (e.g., show error message to user)
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
