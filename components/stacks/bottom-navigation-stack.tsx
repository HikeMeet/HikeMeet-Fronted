import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../../screens/home-page/home";
import ProfilePage from "../../screens/my-profile/my-profile";
import GroupsPage from "../../screens/groups/groups-page";
import TripsPage from "../../screens/trips/trips-page";

const Stack = createNativeStackNavigator();

const BottomNavigationStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfilePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Groups"
        component={GroupsPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Trips"
        component={TripsPage}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default BottomNavigationStack;
