import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainLayout from "./MainLayout";
import { AuthProvider } from "./contexts/auth-context";
// import Mapbox from "@rnmapbox/maps";

if (!process.env.EXPO_LOCAL_SERVER) {
  console.error("API_URL is not defined. Check your .env file.");
}
// Mapbox.setAccessToken(`${process.env.MAPBOX_TOKEN_PUBLIC}`);

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainLayout />
      </NavigationContainer>
    </AuthProvider>
  );
}
