import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

interface ShareTripModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  trip: any;
}

const ShareTripModal: React.FC<ShareTripModalProps> = ({
  visible,
  onClose,
  navigation,
  trip,
}) => {
  const handleShare = () => {
    console.log(`Sharing trip: ${trip?.name}`);
    onClose();
  };

  return (
    <Modal visible={visible} testID="share-trip-modal" transparent>
      <View
        testID="modal-content"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
        >
          <Text testID="modal-title">Share Trip: {trip?.name}</Text>
          <TouchableOpacity testID="share-button" onPress={handleShare}>
            <Text>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="close-modal-button" onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ShareTripModal;
