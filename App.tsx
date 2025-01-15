import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainLayout from "./MainLayout";
import { AuthProvider } from "./contexts/auth-context";


export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainLayout />
      </NavigationContainer>
    </AuthProvider>
  );
}
