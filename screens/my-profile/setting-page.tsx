import React from "react";
import { View, Text } from "react-native";
import SettingsButton from "../../components/settings-buttons";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = ({ navigation }: any) => {
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
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      {/* <Text className="text-lg font-bold mb-4">Settings</Text> */}

      {/* Buttons */}
      <View className="flex-1">
        <SettingsButton
          title="Button 1"
          onPress={() => console.log("Button 1 clicked")}
        />
        <SettingsButton
          title="Button 2"
          onPress={() => console.log("Button 2 clicked")}
        />
      </View>

      {/* Logout Button at the Bottom */}
      <View className="mb-4">
        <SettingsButton
          title="Logout"
          onPress={handleLogout}
          color="bg-red-700"
        />
      </View>
    </View>
  );
};

export default SettingsScreen;
