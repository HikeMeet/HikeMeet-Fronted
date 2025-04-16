import React = require("react");
import { TouchableOpacity, Text } from "react-native";

interface SettingsButtonProps {
  title: string;
  onPress: () => void;
  color?: string; // Optional color parameter
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  title,
  onPress,
  color = "bg-gray-200",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${color} px-4 py-3 rounded mb-3`} // Use the color in the className
    >
      <Text className="text-lg">{title}</Text>
    </TouchableOpacity>
  );
};

export default SettingsButton;
