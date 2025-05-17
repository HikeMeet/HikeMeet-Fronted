import { useState } from "react";
import React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
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
      <ScrollView className="flex-1 bg-white p-4">
        {/* Buttons */}
        <View className="flex-1">
          {isAdmin ? (
            <SettingsButton
              title="Admin settings"
              color="bg-blue-300"
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
          <SettingsButton
            title="Manage notifications"
            onPress={() => navigation.navigate("ManageNotifications")}
          />
          <SettingsButton
            title="Edit profile"
            onPress={() => navigation.navigate("EditProfile")}
          />
          <SettingsButton
            title="Stats"
            onPress={() => navigation.navigate("UserStats")}
          />
          <SettingsButton
            title="Privacy"
            onPress={() => navigation.navigate("PrivacySetting")}
          />

          <SettingsButton
            title="Logout"
            onPress={() => setLogoutPopupVisible(true)}
            color="bg-red-500"
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
            color="bg-red-500"
          />
          <DeleteConfirmPopup
            navigation={navigation}
            visible={deletePopupVisible}
            message="Are you sure you want to delete account?"
            onConfirm={() => setDeleteLogoutPopupVisible(false)}
            onCancel={() => setDeleteLogoutPopupVisible(false)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
