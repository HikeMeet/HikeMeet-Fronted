// App.tsx
import React from "react";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import MainLayout from "./MainLayout";
import { AuthProvider } from "./contexts/auth-context";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NotificationProvider } from "./contexts/notification-context";
import * as Notifications from "expo-notifications";
import { navigationRef } from "./root-navigation";

// Only import and configure Mapbox if not running in Expo Go
let Mapbox;
if (Constants.appOwnership !== "expo") {
  Mapbox = require("@rnmapbox/maps").default;
  Mapbox.setAccessToken(`${process.env.MAPBOX_TOKEN_PUBLIC}`);
} else {
  console.warn("Running in Expo Go: Mapbox features are disabled.");
}

if (!process.env.EXPO_LOCAL_SERVER) {
  console.error("EXPO_LOCAL_SERVER is not defined. Check your .env file.");
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef} >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <MainLayout />
          </GestureHandlerRootView>
        </NavigationContainer>
      </AuthProvider>
    </NotificationProvider>
  );
}
