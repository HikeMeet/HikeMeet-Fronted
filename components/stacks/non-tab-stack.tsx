import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./bottom-tabs";
import SettingsScreen from "../../screens/my-profile/setting-page";
import Home from "../../screens/home-page/home";
import ProfilePage from "../../screens/my-profile/my-profile";

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
          headerShown: false, // Hide the header for the bottom tabs
        }}
      />

      {/* Settings Screen */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true, // Show the header for the settings screen
          title: "Settings", // Set the title for the settings screen
        }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: true, // Show the header for the settings screen
          title: "Home", // Set the title for the settings screen
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          headerShown: true, // Show the header for the settings screen
          title: "Profile", // Set the title for the settings screen
        }}
      />
    </Stack.Navigator>
  );
};

export default NonTabScreensStack;