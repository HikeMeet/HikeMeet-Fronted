// CustomTextInput.tsx
import React from "react";
import {
  View,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface CustomTextInputProps extends TextInputProps {
  iconName: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  iconName,
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
  onPress,
  keyboardType = "default",
  ...rest
}) => (
  <TouchableOpacity
    activeOpacity={1}
    onPress={onPress}
    className="flex-row items-center w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
  >
    <Icon
      name={iconName}
      size={20}
      color="#6B7280"
      style={{ marginRight: 10 }}
    />
    <TextInput
      style={{ flex: 1 }}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#9CA3AF"
      {...rest}
    />
  </TouchableOpacity>
);

export default CustomTextInput;
