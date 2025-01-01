import React from "react";
import { Tabs } from "expo-router";

const TabLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="Home" options={{ title: "Home" }} />
    </Tabs>
  );
};
