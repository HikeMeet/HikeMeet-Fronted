import React, { useState } from "react";
import { View, Text, Button, Modal, ActivityIndicator } from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  message: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  message,
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await Promise.resolve(onConfirm());
    } catch (err) {
      console.error("Error in ConfirmationModal onConfirm:", err);
    } finally {
      setLoading(false);
    }
  };

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
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <View className="bg-white rounded-lg p-6 w-3/4">
          <Text className="text-lg font-bold mb-4">{message}</Text>
          <View className="flex-row justify-between items-center">
            <Button
              title="Cancel"
              color="red"
              onPress={onCancel}
              disabled={loading}
            />
            <View
              style={{
                width: 24,
                height: 24,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {loading && <ActivityIndicator size="small" />}
            </View>
            <Button
              title="Confirm"
              color="blue"
              onPress={handleConfirm}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
