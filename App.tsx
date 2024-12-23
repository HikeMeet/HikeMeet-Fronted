import React from "react";
import LandingPage from "./screens/landing/landing-page";
import LoginPage from "./screens/register-login/login-page";
import RegisterPage from "./screens/register-login/register-page";
import { SafeAreaView } from "react-native";

export default function App() {
  return (
    <SafeAreaView className="flex-1">
      <LandingPage />
    </SafeAreaView>
  );
}
