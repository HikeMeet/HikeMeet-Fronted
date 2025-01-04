import React from "react";
import { TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface BackButtonProps {
  onPress: () => void;
  text?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, text = "Back" }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute top-10 left-4 bg-gray-200 p-3 rounded-full flex-row items-center"
    >
      <Icon name="arrow-left" size={20} color="#333" />
      <Text className="ml-2 text-gray-800 font-bold">{text}</Text>
    </TouchableOpacity>
  );
};

export default BackButton;
