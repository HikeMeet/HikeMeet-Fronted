import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import the account-related screens
import SettingsScreen from "../../screens/my-profile/setting-page";
import AdminSettingPage from "../../screens/admin-settings/admin-page";
import ResetPasswordInsidePage from "../../screens/register-login/reset-password-inside-page";
import UserProfile from "../../screens/my-profile/user-profile";

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
    </Stack.Navigator>
  );
};

export default AccountStack;
