import React, { useState } from "react";
import { View, Text } from "react-native";
import SettingsButton from "../../components/settings-buttons";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoutConfirmPopup from "../../components/logout-confirm-popup";
import DeleteConfirmPopup from "../../components/delete-account-confirm-popup";

const SettingsScreen = ({ navigation }: any) => {
  const [popupVisible, setPopupVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      await AsyncStorage.removeItem("user");
      navigation.navigate("Landing");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  const handleConfirm = () => {
    console.log("Confirmed!");
    setPopupVisible(false);
  };

  const handleCancel = () => {
    console.log("Cancelled!");
    setPopupVisible(false);
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      {/* <Text className="text-lg font-bold mb-4">Settings</Text> */}

      {/* Buttons */}
      <View className="flex-1">
        <SettingsButton
          title="Button 1"
          onPress={() => console.log("Button 1 clicked")}
        />
        <SettingsButton
          title="Reset password"
          onPress={() => console.log("go to reset page")}
        />
      </View>

      {/* Logout Button at the Bottom */}
      <View className="mb-4">
        <SettingsButton
          title="Logout"
          onPress={() => setPopupVisible(true)}
          color="bg-red-700"
        />
        <LogoutConfirmPopup
          visible={popupVisible}
          message="Are you sure you want log out?"
          onConfirm={handleLogout}
          onCancel={() => setPopupVisible(false)}
        />
        <SettingsButton
          title="Delete account"
          onPress={() => setPopupVisible(true)}
          color="bg-red-700"
        />
        <DeleteConfirmPopup
          visible={popupVisible}
          message="Are you sure you want to delete account?"
          onConfirm={() => {
            console.log("delete");
          }}
          onCancel={() => setPopupVisible(false)}
        />
      </View>
    </View>
  );
};

export default SettingsScreen;
