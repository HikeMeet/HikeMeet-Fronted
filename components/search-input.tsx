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
      <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-300">
        <Ionicons
          name="search"
          size={20}
          color="gray"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder={placeholder}
          onChangeText={onChangeText}
          editable={editable}
          autoFocus={autoFocus}
          className="flex-1 text-gray-600 text-sm"
        />
      </View>
    </TouchableOpacity>
  );
};

export default SearchInput;
