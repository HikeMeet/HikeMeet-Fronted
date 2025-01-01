import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseconfig";
import SignInLandingStack from "./components/stacks/signin-landing-stack";
import BottomNavigationStack from "./components/stacks/bottom-navigation-stack";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      console.log("XXX", currentUser);
      setUser(currentUser);
    });
  }, []);

  return (
    <NavigationContainer>
      {user ? <BottomNavigationStack /> : <SignInLandingStack />}
    </NavigationContainer>
  );
}
