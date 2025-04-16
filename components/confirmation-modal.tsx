import React = require("react");
import { View, Text, Button, Modal } from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.2)", // Lighter overlay
        }}
      >
        <View className="bg-white rounded-lg p-6 w-3/4">
          <Text className="text-lg font-bold mb-4">{message}</Text>
          <View className="flex-row justify-between">
            <Button title="Cancel" color="red" onPress={onCancel} />
            <Button title="Confirm" color="blue" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
