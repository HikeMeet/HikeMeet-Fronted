// App.tsx
import React from "react";
import { useEffect } from "react";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import MainLayout from "./MainLayout";
import { AuthProvider } from "./contexts/auth-context";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
// Only import and configure Mapbox if not running in Expo Go
let Mapbox;
if (Constants.appOwnership !== "expo") {
  Mapbox = require("@rnmapbox/maps").default;
  Mapbox.setAccessToken(`${process.env.MAPBOX_TOKEN_PUBLIC}`);
} else {
  console.warn("Running in Expo Go: Mapbox features are disabled.");
}

if (!process.env.EXPO_LOCAL_SERVER) {
  console.error("API_URL is not defined. Check your .env file.");
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  try {
    let token;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    console.log("📡 Existing permission status:", existingStatus);

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("📡 Final permission status after request:", finalStatus);
    }

    if (finalStatus !== "granted") {
      console.warn("🚫 Permission not granted");
      return null;
    }

    const result = await Notifications.getExpoPushTokenAsync();
    console.log("📬 Token result object:", result);

    token = result.data;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } catch (error) {
    console.error("❌ Error in registerForPushNotificationsAsync:", error);
    return null;
  }
}

export default function App() {
  useEffect(() => {
    console.log("⚠️ 11111");

    registerForPushNotificationsAsync()
      .then((token) => {
        console.log("✅ Finished register function");
        if (token) {
          console.log("📲 Expo Push Token:", token);
        } else {
          console.log("⚠️ No token returned");
        }
      })
      .catch((err) => {
        console.error("❌ Error while registering for notifications:", err);
      });
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MainLayout />
        </GestureHandlerRootView>
      </NavigationContainer>
    </AuthProvider>
  );
}
