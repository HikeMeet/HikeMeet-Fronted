import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./bottom-tabs";
import Home from "../../screens/home-page/home";
import SearchPage from "../../screens/search/search-page";
import AccountStack from "./account-setting-stack";
import TripsStack from "./trip-proccess-stack";
import GroupsStack from "./group-proccess-stack";
import { Provider } from "react-native-paper";
import PostStack from "./posts-proccess-stack";
import NotificationsPage from "../../screens/notifications/notification-list-page";
import ReportAdminTable from "../../screens/admin-settings/report-admin-table";
import ChatStack from "./chat-stack";
//
// Import the new AccountStack

const Stack = createNativeStackNavigator();

const NonTabScreensStack = () => {
  return (
    <Provider>
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
        <Stack.Screen
          name="GroupsStack"
          component={GroupsStack}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminStack"
          component={ReportAdminTable}
          options={{ title: "Admin Reports" }}
        />

        <Stack.Screen
          name="ChatStack"
          component={ChatStack}
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
          name="PostStack"
          component={PostStack}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SearchPage"
          component={SearchPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationsPage"
          component={NotificationsPage}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </Provider>
  );
};

export default NonTabScreensStack;
