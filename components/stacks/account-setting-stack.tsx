import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import the account-related screens
import SettingsScreen from "../../screens/my-profile/setting-page";
import AdminSettingPage from "../../screens/admin-settings/admin-page";
import ResetPasswordInsidePage from "../../screens/register-login/reset-password-inside-page";
import UserProfile from "../../screens/my-profile/user-profile";
import CommunityGuidelines from "../../screens/my-profile/comunity-guid-page";
import SavedPosts from "../../screens/my-profile/my-saved-posts";
import LikedPosts from "../../screens/my-profile/my-liked-posts";
import RankingSystem from "../../screens/my-profile/ranking-system";
import ManageNotifications from "../../screens/my-profile/manage-notificaitons";
import EditProfilePage from "../../screens/my-profile/edit-profile-page";
import StatsPage from "../../screens/my-profile/user-stats-page";
import ReportAdminTable from "../../screens/admin-settings/report-admin-table";

const Stack = createNativeStackNavigator();

const AccountStack = () => {
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: true, title: "Settings" }}
      />
      <Stack.Screen
        name="AdminSettings"
        component={AdminSettingPage}
        options={{ headerShown: true, title: "Admin Settings" }}
      />
      <Stack.Screen
        name="ResetPasswordInside"
        component={ResetPasswordInsidePage}
        options={{ headerShown: true, title: "Reset Password" }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{ headerShown: false, title: "User Profile" }}
      />
      <Stack.Screen
        name="ComunitiyGuidlined"
        component={CommunityGuidelines}
        options={{ headerShown: false, title: "Comunitiy Guidlined" }}
      />
      <Stack.Screen
        name="AboutRankingSystem"
        component={RankingSystem}
        options={{ headerShown: false, title: "Ranking System" }}
      />
      <Stack.Screen
        name="SavedPosts"
        component={SavedPosts}
        options={{ headerShown: true, title: "Saved Posts" }}
      />
      <Stack.Screen
        name="LikedPosts"
        component={LikedPosts}
        options={{ headerShown: true, title: "Liked Posts" }}
      />
      <Stack.Screen
        name="ManageNotifications"
        component={ManageNotifications}
        options={{ headerShown: true, title: "Manage Notifications" }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfilePage}
        options={{ headerShown: true, title: "Edit Profile" }}
      />
      <Stack.Screen
        name="UserStats"
        component={StatsPage}
        options={{ headerShown: true, title: "User Stats" }}
      />

      <Stack.Screen
        name="ReportAdminPage"
        component={ReportAdminTable}
        options={{ title: "Admin Reports" }}
      />
    </Stack.Navigator>
  );
};

export default AccountStack;
