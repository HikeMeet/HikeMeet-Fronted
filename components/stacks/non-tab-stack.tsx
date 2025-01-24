import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./bottom-tabs";
import SettingsScreen from "../../screens/my-profile/setting-page";
import Home from "../../screens/home-page/home";
import ResetPasswordInsidePage from "../../screens/register-login/reset-password-inside-page";
import CreatePostPage from "../../screens/post-creation/post-creation-page";
import ProfilePage from "../../screens/my-profile/my-profile";
import UserProfile from "../../screens/my-profile/user-profile";
import SearchPage from "../../screens/search/search-page";

const Stack = createNativeStackNavigator();

const NonTabScreensStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{ headerShown: false }}
    >
      {/* Tab Navigator */}
      <Stack.Screen
        name="Tabs"
        component={BottomTabs}
        options={{
          headerShown: false,
        }}
      />

      {/* Settings Screen */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          title: "Home",
        }}
      />
      <Stack.Screen
        name="ResetPasswordInside"
        component={ResetPasswordInsidePage}
        options={{
          headerShown: true,
          title: "Reset Password",
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostPage}
        options={{
          headerShown: true,
          title: "Create Post",
        }}
      />
      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{
          headerShown: false,
          title: "Create Post",
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          headerShown: false,
          title: "Create Post",
        }}
      />
        <Stack.Screen
          name="SearchPage"
          component={SearchPage}
          options={{ headerShown: false }}
        />
    </Stack.Navigator>
  );
};

export default NonTabScreensStack;
