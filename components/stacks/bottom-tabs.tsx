import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../../screens/home-page/home";
import ProfilePage from "../../screens/my-profile/my-profile";
import GroupsPage from "../../screens/groups/groups-page";
import ChatListPage from "../../screens/chats/caht-list";
import CustomTabBar from "../custom-tab-bar";
import { Provider } from "react-native-paper";
import TripsStack from "./trip-proccess-stack";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Provider>
      <Tab.Navigator
        initialRouteName="Home" // Set the default page here
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }, // מחביא את הטאב המובנה
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Profile" component={ProfilePage} />
        <Tab.Screen name="Groups" component={GroupsPage} />
        <Tab.Screen name="Trips" component={TripsStack} />
        <Tab.Screen name="Chats" component={ChatListPage} />
      </Tab.Navigator>
    </Provider>
  );
};

export default BottomTabs;
