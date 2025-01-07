import React, { useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../contexts/auth-context";

const Home = ({ navigation }: any) => {
  const { user, setUser, isVerified, setIsVerified } = useAuth();

  useEffect(() => {
    const checkUserState = async () => {
      if (!user || !isVerified) {
        Alert.alert("Session Expired", "Please log in again.");
        navigation.navigate("Landing");
      }
    };

    checkUserState();
  }, [user, isVerified, navigation]);

  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      await AsyncStorage.removeItem("user");
      navigation.navigate("Landing");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to the Home Page</Text>
      <Text style={{ marginTop: 10 }}>
        {user?.email || "No user information available"}
      </Text>

      <Button onPress={handleLogout} title="Logout" />
    </View>
  );
};

export default Home;
