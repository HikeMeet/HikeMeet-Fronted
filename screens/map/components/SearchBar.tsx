// SearchBar.tsx
import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (val: string) => void;
  onSearch: () => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  onSearch,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <View className="flex-row items-center space-x-2">
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        className="flex-1 bg-gray-200 px-3 py-2 rounded"
      />
      <TouchableOpacity
        onPress={onSearch}
        className="bg-blue-600 px-3 py-2 rounded"
      >
        <Text className="text-white font-semibold">Search</Text>
      </TouchableOpacity>
    </View>
  );
}
