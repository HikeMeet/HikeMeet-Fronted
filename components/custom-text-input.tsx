import React from "react";
import { View, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface CustomTextInputProps {
  iconName: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  iconName,
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
  keyboardType = "default",
}) => {
  return (
    <View className="flex-row items-center w-full p-4 border border-gray-300 rounded-lg bg-white mb-4">
      <Icon name={iconName} size={20} color="#aaa" style={{ marginRight: 8 }} />
      <TextInput
        className="flex-1 text-gray-800 text-lg"
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#aaa"
      />
    </View>
  );
};

export default CustomTextInput;
