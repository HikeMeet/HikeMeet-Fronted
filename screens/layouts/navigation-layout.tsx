import React from "react";
import { Tabs } from "expo-router";
import Home from "../home-page/home";
import MyTabBar from "../../components/tab-bar";

const TabLayout = () => {
  return (
    <Tabs tabBar={(props) => <MyTabBar {...props} />}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="grups" options={{ title: "Groups" }} />
      <Tabs.Screen name="trips" options={{ title: "Trips" }} />
      <Tabs.Screen name="chats" options={{ title: "Chats" }} />
    </Tabs>
  );
};
export default TabLayout;
