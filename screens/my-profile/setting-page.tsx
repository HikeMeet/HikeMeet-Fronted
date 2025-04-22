import { useState } from "react";
import React from "react";
import { View, SafeAreaView } from "react-native";
import SettingsButton from "../../components/settings-buttons";
import LogoutConfirmPopup from "../../components/logout-confirm-popup";
import DeleteConfirmPopup from "../../components/delete-account-confirm-popup";
import { useAuth } from "../../contexts/auth-context";

const SettingsScreen = ({ navigation }: any) => {
  const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);
  const [deletePopupVisible, setDeleteLogoutPopupVisible] = useState(false);
  const { mongoUser } = useAuth();
  const isAdmin = mongoUser?.role === "admin" ? true : false;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white p-4">
        {/* Header */}
        {/* <Text className="text-lg font-bold mb-4">Settings</Text> */}

        {/* Buttons */}
        <View className="flex-1">
          {isAdmin ? (
            <SettingsButton
              title="Admin settings"
              onPress={() => navigation.navigate("AdminSettings")}
            />
          ) : null}
          <SettingsButton
            title="Reset password"
            onPress={() => navigation.navigate("ResetPasswordInside")}
          />
          <SettingsButton
            title="Community guidlines"
            onPress={() => navigation.navigate("ComunitiyGuidlined")}
          />

          <SettingsButton
            title="About ranking system"
            onPress={() => navigation.navigate("AboutRankingSystem")}
          />

          <SettingsButton
            title="Saved posts"
            onPress={() => navigation.navigate("SavedPosts")}
          />
          <SettingsButton
            title="Liked posts"
            onPress={() => navigation.navigate("LikedPosts")}
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
