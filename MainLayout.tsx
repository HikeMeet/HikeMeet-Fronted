import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./contexts/AuthContext";
import SignInLandingStack from "./components/stacks/signin-landing-stack";
import BottomTabs from "./components/stacks/bottom-tabs";
import { View, ActivityIndicator } from "react-native";

const MainLayout = () => {
  const { user, isVerified } = useAuth();
  const [initialRoute, setInitialRoute] = useState<string>("Landing");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadInitialRoute = async () => {
      const storedRoute = await AsyncStorage.getItem("lastRoute");
      setInitialRoute(storedRoute || (user ? (isVerified ? "Home" : "Verify") : "Landing"));   //need to fix navigation to home
      setLoading(false);
    };
    loadInitialRoute();
  }, [user, isVerified]);

  useEffect(() => {
    AsyncStorage.setItem("lastRoute", user ? (isVerified ? "Home" : "Verify") : "Landing");   //need to fix navigation to home
  }, [user, isVerified]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) return <SignInLandingStack />;   //need to combine with !isVerified
  if (!isVerified) return <SignInLandingStack />;
  return <BottomTabs />;
};

export default MainLayout;
