import React = require("react");
import { View, TextInput, TextInputProps } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface CustomTextInputProps extends TextInputProps {
  iconName: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onPress?: () => void; // Add an optional onFocus prop
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  testID?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  iconName,
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
  onPress,
  keyboardType = "default",
  testID,
  ...rest
}) => {
  return (
    <View className="flex-row items-center w-full px-4 py-3 border border-gray-300 rounded-md bg-white mb-3">
      <Icon name={iconName} size={20} color="#aaa" style={{ marginRight: 8 }} />
      <TextInput
        className="flex-1 text-gray-800 text-base h-12 leading-6"
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        onPress={onPress}
        keyboardType={keyboardType}
        placeholderTextColor="#aaa"
        testID={testID}
        {...rest} // Spread other props for flexibility
      />
    </View>
  );
};

export default CustomTextInput;
