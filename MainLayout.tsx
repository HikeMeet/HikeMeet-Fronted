import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./contexts/auth-context";
import SignInLandingStack from "./components/stacks/signin-landing-stack";
import { View, ActivityIndicator } from "react-native";
import NonTabScreensStack from "./components/stacks/non-tab-stack";

const MainLayout = () => {
  const { user, isVerified } = useAuth();
  const [initialRoute, setInitialRoute] = useState<string>("Landing");
  const [loading, setLoading] = useState<boolean>(true);

  // need to delete (never used)
  useEffect(() => {
    const loadInitialRoute = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedRoute = await AsyncStorage.getItem("lastRoute");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.emailVerified) {
            setInitialRoute("Home");
          } else {
            setInitialRoute("Verify");
          }
        } else {
          setInitialRoute("Landing");
        }

        // שמירה של המסלול האחרון
        if (storedRoute) {
          setInitialRoute(storedRoute);
        }
      } catch (error) {
        console.error("Error loading initial route:", error);
        setInitialRoute("Landing");
      } finally {
        setLoading(false);
      }
    };

    loadInitialRoute();
  }, []);

  useEffect(() => {
    const updateLastRoute = async () => {
      if (!loading) {
        const route = user ? (isVerified ? "Home" : "Verify") : "Landing";
        await AsyncStorage.setItem("lastRoute", route);
      }
    };

    updateLastRoute();
  }, [user, isVerified, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) return <SignInLandingStack />;
  if (!isVerified) return <SignInLandingStack />;
  return <NonTabScreensStack />;
};

export default MainLayout;
