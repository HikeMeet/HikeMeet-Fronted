import React from "react";
import { View, Text, Button } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import NavigationBar from "../../components/NavigationBar";

const Home = ({ navigation }: any) => {
  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      console.log("User signed out");
      setTimeout(() => {
        navigation.navigate("Login");
      }, 100);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <Text className="text-2xl font-bold">Home Page</Text>
      <Button onPress={() => navigation.navigate("Home")} title="Home" />
      <Button onPress={handleLogout} title="Logout" />

      {/* Navigation Bar */}
      <NavigationBar navigation={navigation} />
    </View>
  );
};

export default Home;
