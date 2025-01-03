import React from "react";
import { View, Text, Button } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import { useAuth } from "../../contexts/AuthContext";

const Home = ({ navigation }: any) => {
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      setUser(null); // Clear user context
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Page</Text>
      <Button onPress={() => navigation.navigate("Home")} title="Go to Home" />
      <Button onPress={handleLogout} title="Logout" />
    </View>
  );
};

export default Home;
