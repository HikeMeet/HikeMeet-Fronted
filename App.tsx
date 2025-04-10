// App.tsx
import React from "react";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import MainLayout from "./MainLayout";
import { AuthProvider } from "./contexts/auth-context";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

export default function App() {
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
