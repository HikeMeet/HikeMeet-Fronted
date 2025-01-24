import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SearchInputProps = {
  placeholder: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  onPress?: () => void;
  autoFocus?: boolean;
};

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  onChangeText,
  editable = true,
  onPress,
  autoFocus = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={editable ? 1 : 0.8}>
      <View className="flex-row items-center bg-gray-200 rounded-full px-6 py-3 shadow-lg">
        <Ionicons name="search" size={28} color="gray" style={{ marginRight: 12 }} />
        <TextInput
          placeholder={placeholder}
          onChangeText={onChangeText}
          editable={editable}
          autoFocus={autoFocus}
          className="flex-1 text-gray-700 text-lg"
        />
      </View>
    </TouchableOpacity>
  );
};

export default SearchInput;
