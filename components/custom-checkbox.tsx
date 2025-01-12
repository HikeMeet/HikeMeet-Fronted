import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export default function CustomCheckbox({
  checked,
  onChange,
  label,
}: CustomCheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onChange}
      className="flex-row items-center space-x-2"
    >
      <View
        className={`w-6 h-6 rounded border ${
          checked ? "bg-green-500 border-green-500" : "bg-white border-gray-300"
        } items-center justify-center`}
      >
        {checked && <Text className="text-white font-bold">✔</Text>}
      </View>
      {label && <Text className="text-gray-300">{label}</Text>}
    </TouchableOpacity>
  );
}
