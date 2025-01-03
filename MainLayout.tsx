import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./contexts/AuthContext";
import SignInLandingStack from "./components/stacks/signin-landing-stack";
import BottomTabs from "./components/stacks/bottom-tabs";
import { View, ActivityIndicator } from "react-native";

const MainLayout = () => {
  const { user } = useAuth();
  const [initialRoute, setInitialRoute] = useState<string>("Landing");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadInitialRoute = async () => {
      const storedRoute = await AsyncStorage.getItem("lastRoute");
      setInitialRoute(storedRoute || (user ? "Home" : "Landing"));
      setLoading(false);
    };
    loadInitialRoute();
  }, [user]);

  useEffect(() => {
    AsyncStorage.setItem("lastRoute", user ? "Home" : "Landing");
  }, [user]);


  return user ? <BottomTabs  /> : <SignInLandingStack />;
};

export default MainLayout;
