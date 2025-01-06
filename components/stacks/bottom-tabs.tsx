import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../../screens/home-page/home";
import ProfilePage from "../../screens/my-profile/my-profile";
import GroupsPage from "../../screens/groups/groups-page";
import TripsPage from "../../screens/trips/trips-page";
import ChatListPage from "../../screens/chats/caht-list";
import CustomTabBar from "../CustomTabBar";
import { Provider } from "react-native-paper";
import LoginPage from "../../screens/register-login/login-page";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Provider>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }, // מחביא את הטאב המובנה
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
        >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Profile" component={ProfilePage} />
        <Tab.Screen name="Groups" component={GroupsPage} />
        <Tab.Screen name="Trips" component={TripsPage} />
        <Tab.Screen name="Chats" component={ChatListPage} />
        <Tab.Screen name="Login" component={LoginPage} />
      </Tab.Navigator>
    </Provider>
  );
};

export default BottomTabs;
