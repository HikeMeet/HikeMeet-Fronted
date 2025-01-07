import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

interface SettingsButtonProps {
  title: string;
  onPress: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-200 px-4 py-3 rounded mb-3"
    >
      <Text className="text-lg">{title}</Text>
    </TouchableOpacity>
  );
};

export default SettingsButton;
