// screens/settings/SettingsScreen.tsx
import React from "react";
import { View, Text } from "react-native";
import SettingsButton from "../../components/settings-buttons";

const SettingsScreen = () => {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-lg font-bold mb-4">Settings</Text>
      <SettingsButton
        title="Button 1"
        onPress={() => console.log("Button 1 clicked")}
      />
      <SettingsButton
        title="Button 2"
        onPress={() => console.log("Button 2 clicked")}
      />
      <SettingsButton
        title="Button 3"
        onPress={() => console.log("Button 3 clicked")}
      />
    </View>
  );
};

export default SettingsScreen;
