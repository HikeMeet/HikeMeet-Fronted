import React, { useState } from "react";
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
  const handleCustomTextChange = (text: string) => {
    setCustomText(text); // Update the input field's text
  };

  const handleConfirmCustomText = () => {
    if (customText.trim() !== "") {
      setConfirmedCustomText(customText); // Save the confirmed custom text
      onValueChange(customText); // Update the dropdown value
    }
  };

  return (
    <View className="w-full">
      {/* Gender Picker */}
      <View className="flex-row items-center w-full px-3 py-3 border border-gray-300 rounded-md bg-white mb-3">
        <Icon
          name={iconName}
          size={16}
          color="#aaa"
          style={{ marginRight: 6 }}
        />
        <Picker
          testID="gender-picker"
          selectedValue={value}
          onValueChange={(itemValue) => {
            if (itemValue !== "other") {
              setCustomText(""); // Clear custom text if not "Other"
              setConfirmedCustomText(""); // Clear confirmed text
            }
            onValueChange(itemValue);
          }}
          style={{ flex: 1, color: "#333", fontSize: 14 }} // Adjust font size and flex
          dropdownIconColor="#aaa"
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
          {/* Add a dynamic item for confirmed custom text */}
          {confirmedCustomText.trim() !== "" && (
            <Picker.Item
              label={confirmedCustomText}
              value={confirmedCustomText}
            />
          )}
        </Picker>
      </View>

      {/* Custom Text Input */}
      {value === "other" && (
        <View className="relative">
          <View className="flex-row items-center w-full px-3 py-3 border border-gray-300 rounded-md bg-white mb-3">
            <Icon
              name="pencil"
              size={16}
              color="#aaa"
              style={{ marginRight: 6 }}
            />
            <TextInput
              className="flex-1 text-gray-800 text-sm h-12 leading-4"
              placeholder="Please specify"
              placeholderTextColor="#aaa"
              value={customText}
              onChangeText={handleCustomTextChange}
            />
            {/* Cube Button */}
            <TouchableOpacity
              onPress={handleConfirmCustomText}
              className="absolute right-3 bg-blue-500 w-8 h-8 items-center justify-center rounded"
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
