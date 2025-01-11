import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import SettingsButton from "../../components/settings-buttons";
import LogoutConfirmPopup from "../../components/logout-confirm-popup";
import DeleteConfirmPopup from "../../components/delete-account-confirm-popup";

const SettingsScreen = ({ navigation }: any) => {
  const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);
  const [deletePopupVisible, setDeleteLogoutPopupVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
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
            onPress={() => navigation.navigate("ResetPasswordInside")}
          />
        </View>

        {/* Logout Button at the Bottom */}
        <View className="mb-4">
          <SettingsButton
            title="Logout"
            onPress={() => setLogoutPopupVisible(true)}
            color="bg-red-700"
          />
          <LogoutConfirmPopup
            navigation={navigation}
            visible={logoutPopupVisible}
            message="Are you sure you want log out?"
            onConfirm={() => setLogoutPopupVisible(false)}
            onCancel={() => setLogoutPopupVisible(false)}
          />
          <SettingsButton
            title="Delete account"
            onPress={() => setDeleteLogoutPopupVisible(true)}
            color="bg-red-700"
          />
          <DeleteConfirmPopup
            navigation={navigation}
            visible={deletePopupVisible}
            message="Are you sure you want to delete account?"
            onConfirm={() => setDeleteLogoutPopupVisible(false)}
            onCancel={() => setDeleteLogoutPopupVisible(false)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
