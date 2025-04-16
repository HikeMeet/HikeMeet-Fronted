import React = require("react");
import { View, Text } from "react-native";

interface ErrorAlertProps {
  message: string;
}

const ErrorAlertComponent: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <View className="bg-red-100 p-3 my-2 rounded-md">
      <Text className="text-red-800 text-lg text-center">{message}</Text>
    </View>
  );
};

export default ErrorAlertComponent;
