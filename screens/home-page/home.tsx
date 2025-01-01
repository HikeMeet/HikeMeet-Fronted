import { View, Text } from "react-native";
import React from "react";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import { Button } from "react-native";

const Home = ({ navigation }: any) => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>home-page</Text>
      <Button onPress={() => navigation.navigate("Home")} title="Home" />
      <Button
        onPress={() => {
          FIREBASE_AUTH.signOut();
          navigation.navigate("Landing");
        }}
        title="Logout"
      />
    </View>
  );
};

export default Home;
