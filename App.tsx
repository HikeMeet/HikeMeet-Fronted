import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainLayout from "./MainLayout";
import { AuthProvider } from "./contexts/auth-context";

if (!process.env.EXPO_LOCAL_SERVER) {
  console.error("API_URL is not defined. Check your .env file.");
}
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainLayout />
      </NavigationContainer>
    </AuthProvider>
  );
}
