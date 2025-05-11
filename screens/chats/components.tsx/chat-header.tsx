import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface ChatHeaderProps {
  avatarUrl?: string;
  title: string;
  onBack: () => void;
  onAvatarPress: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  avatarUrl,
  title,
  onBack,
  onAvatarPress,
}) => (
  <View style={styles.container}>
    <TouchableOpacity
      onPress={onBack}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon name="arrow-left" size={24} color="#374151" />
    </TouchableOpacity>

    <TouchableOpacity onPress={onAvatarPress} style={styles.avatarWrapper}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
    </TouchableOpacity>

    <Text numberOfLines={1} style={styles.title}>
      {title}
    </Text>

    {/* Optional right‐side actions */}
    {/* <TouchableOpacity>
      <Icon name="dots-vertical" size={24} color="#374151" />
    </TouchableOpacity> */}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarWrapper: {
    marginLeft: 12,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1d5db",
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
});

export default ChatHeader;
