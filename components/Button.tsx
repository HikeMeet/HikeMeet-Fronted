import React = require("react");
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  color?: string; // צבע מותאם
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  isLoading,
  color = "bg-blue-500",
  disabled,
}) => {
  return (
    <TouchableOpacity
      className={`w-full py-4 rounded-lg ${color} ${disabled ? "opacity-50" : ""}`}
      onPress={onPress}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-center text-white text-lg font-bold">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
