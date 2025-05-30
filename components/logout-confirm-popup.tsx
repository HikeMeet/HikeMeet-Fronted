import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { FIREBASE_AUTH } from "../firebaseconfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotification } from "../contexts/notification-context";
import { useChatList } from "../contexts/chat-context";

interface ConfirmPopupProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  navigation: any;
}

const LogoutConfirmPopup: React.FC<ConfirmPopupProps> = ({
  visible,
  message,
  onConfirm,
  onCancel,
  navigation,
}) => {
  const { expoPushToken } = useNotification();
  const { clearAllListeners } = useChatList();
  const handleLogout = async () => {
    try {
      // 1) Unregister this device token
      if (expoPushToken && FIREBASE_AUTH.currentUser) {
        const idToken = await FIREBASE_AUTH.currentUser.getIdToken(true);
        await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/user/unregister-token`,
          {
            method: "DELETE", // or POST if you prefer
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ token: expoPushToken }),
          }
        );
      }

      // 2) Sign out and clear storage
      await clearAllListeners();
      await FIREBASE_AUTH.signOut();
      await AsyncStorage.removeItem("user");
      navigation.navigate("Landing");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 bg-white rounded-lg p-6">
          <Text className="text-lg font-medium text-center mb-4">
            {message}
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="flex-1 mr-2 bg-red-500 py-2 rounded-lg items-center"
              onPress={onCancel} // Automatically close on cancel
            >
              <Text className="text-white text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 ml-2 bg-green-500 py-2 rounded-lg items-center"
              onPress={() => {
                onConfirm();
                handleLogout();
              }} // Handle confirm logic
            >
              <Text className="text-white text-base">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutConfirmPopup;
