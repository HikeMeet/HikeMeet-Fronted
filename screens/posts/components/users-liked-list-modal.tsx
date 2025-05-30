// LikesModal.tsx
import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { IUser } from "../../../interfaces/post-interface";
import UserRow from "../../../components/user-row-search";
import { useAuth } from "../../../contexts/auth-context";

interface LikesModalProps {
  visible: boolean;
  onClose: () => void;
  likes: (IUser | string)[];
  navigation: any;
}

const LikesModal: React.FC<LikesModalProps> = ({
  visible,
  onClose,
  likes,
  navigation,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Tappable overlay to dismiss */}
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.modalContainer}>
          <View style={styles.handle} />
          <Text style={styles.title}>Liked by</Text>
          <ScrollView>
            {likes.map((like, index) => {
              let user: IUser;

              if (typeof like === "string") {
                user = {
                  _id: like,
                  username: "Unkno",
                  profile_picture: {
                    url: "https://via.placeholder.com/150",
                    image_id: "",
                  },
                };
              } else {
                user = like;
              }
              return (
                <UserRow
                  key={user._id || index}
                  user={user}
                  onStatusChange={(newStatus: string) =>
                  }
                  navigation={navigation}
                />
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)", // Lighter overlay
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    minHeight: "85%",
    maxHeight: "85%", // Increased from 75% to 85%
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: "#eee",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    textAlign: "center",
    color: "#333",
    fontSize: 16,
  },
});

export default LikesModal;
