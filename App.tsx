import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingPage from "./screens/landing/landing-page";
import LoginPage from "./screens/register-login/login-page";
import RegisterPage from "./screens/register-login/register-page";
import Home from "./screens/home-page/home";
import MyProfile from "./screens/my-profile/my-profile";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "./firebaseconfig";
import VerificationPage from "./screens/register-login/VerificationPage";

const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();

function InsideLayout() {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="Home" component={Home} options={{ headerShown: true }} />
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
     onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        {user ? (
          <Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="VerificationPage" component={VerificationPage} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterPage} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
