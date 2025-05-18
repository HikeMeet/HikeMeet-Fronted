// MainLayout.tsx
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "./contexts/auth-context"; // brings in user, isVerified, mongoUser :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
import SignInLandingStack from "./components/stacks/signin-landing-stack";
import NonTabScreensStack from "./components/stacks/non-tab-stack";

const MainLayout: React.FC = () => {
  const { user, isVerified, mongoUser } = useAuth();

  // 1) Not signed in or email not verified → auth stack
  if (!user || !isVerified) {
    return <SignInLandingStack />;
  }

  // 2) Firebase auth is good, but mongoUser hasn’t loaded yet → spinner
  if (!mongoUser) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 3) All set → your real app stack
  return <NonTabScreensStack />;
};

export default MainLayout;
