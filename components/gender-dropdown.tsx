import { useState } from "react";
import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface GenderDropdownProps {
  iconName: string;
  value: string;
  onValueChange: (value: string) => void;
}

const GenderDropdown: React.FC<GenderDropdownProps> = ({
  iconName,
  value,
  onValueChange,
}) => {
  const [customText, setCustomText] = useState("");
  const [confirmedCustomText, setConfirmedCustomText] = useState("");

  const handleConfirmCustomText = () => {
    if (customText.trim()) {
      setConfirmedCustomText(customText);
      onValueChange(customText);
    }
  };

  return (
    <View className="w-full ">
      {/* Gender Picker */}
      <View className="flex-row items-center w-full px-4 py-2 h-12 border border-gray-200 rounded-lg bg-gray-50">
        <View className="mr-2">
          <Icon name={iconName} size={20} color="#6B7280" />
        </View>
        <Picker
          testID="gender-picker"
          selectedValue={value}
          onValueChange={(item) => {
            if (item !== "other") {
              setCustomText("");
              setConfirmedCustomText("");
            }
            onValueChange(item);
          }}
          style={{ flex: 1 }}
          dropdownIconColor="#6B7280"
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
          {confirmedCustomText ? (
            <Picker.Item
              label={confirmedCustomText}
              value={confirmedCustomText}
            />
          ) : null}
        </Picker>
      </View>

      {/* “Other” custom input */}
      {value === "other" && (
        <View className="relative">
          <View className="flex-row items-center w-full px-4 py-2 h-12 border border-gray-200 rounded-lg bg-gray-50">
            <View className="mr-2">
              <Icon name="pencil" size={20} color="#6B7280" />
            </View>
            <TextInput
              className="flex-1 text-gray-800 text-sm"
              placeholder="Please specify"
              placeholderTextColor="#9CA3AF"
              value={customText}
              onChangeText={setCustomText}
            />
            <TouchableOpacity
              onPress={handleConfirmCustomText}
              className="absolute right-3 top-3 w-6 h-6 bg-green-600 rounded items-center justify-center"
            >
              <Icon name="check" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default GenderDropdown;
