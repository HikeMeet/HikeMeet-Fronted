import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";

interface ConfirmPopupProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const LogoutConfirmPopup: React.FC<ConfirmPopupProps> = ({
  visible,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 bg-white rounded-lg p-6">
          <Text className="text-lg font-medium text-center mb-4">
            {message}
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="flex-1 mr-2 bg-red-500 py-2 rounded-lg items-center"
              onPress={onCancel} // Automatically close on cancel
            >
              <Text className="text-white text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 ml-2 bg-green-500 py-2 rounded-lg items-center"
              onPress={onConfirm} // Handle confirm logic
            >
              <Text className="text-white text-base">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutConfirmPopup;
