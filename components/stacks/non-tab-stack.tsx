import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./bottom-tabs";
import Home from "../../screens/home-page/home";
import CreatePostPage from "../../screens/post-creation/post-creation-page";
import SearchPage from "../../screens/search/search-page";
import AccountStack from "./account-setting-stack";
import TripsStack from "./trip-proccess-stack";
// Import the new AccountStack

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

      {/* Account Stack (Settings, AdminSettings, ResetPasswordInside, UserProfile) */}
      <Stack.Screen
        name="AccountStack"
        component={AccountStack}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="TripsStack"
        component={TripsStack}
        options={{ headerShown: false }}
      />

      {/* Other Screens */}
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          title: "Home",
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
        name="SearchPage"
        component={SearchPage}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default NonTabScreensStack;
