// components/chat/MuteToggleButton.tsx
import React, { useState, useEffect } from "react";
import { Pressable, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../../contexts/auth-context";
import {
  muteChat,
  unmuteChat,
} from "../../../components/requests/chats-requsts";

interface MuteToggleButtonProps {
  roomId: string;
}

const MuteToggleButton: React.FC<MuteToggleButtonProps> = ({ roomId }) => {
  const { mongoUser, getToken, setMongoUser } = useAuth();
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // keep local state in sync with user data
  useEffect(() => {
    setIsMuted(mongoUser?.muted_chats.includes(roomId) ?? false);
  }, [mongoUser, roomId]);

  const toggleMute = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      if (isMuted) {
        await unmuteChat(token, roomId);
        setMongoUser({
          ...mongoUser!,
          muted_chats: mongoUser!.muted_chats.filter((id) => id !== roomId),
        });
      } else {
        await muteChat(token, roomId);
        setMongoUser({
          ...mongoUser!,
          muted_chats: [...mongoUser!.muted_chats, roomId],
        });
      }
    } catch (e: any) {
      console.error("Mute toggle error:", e);
      Alert.alert("Error", e.message);
    }
  };

  return (
    <Pressable
      onPress={toggleMute}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <Icon
        name={isMuted ? "bell-off" : "bell"}
        size={22}
        color={isMuted ? "#9ca3af" : "#6b7280"}
      />
    </Pressable>
  );
};

export default MuteToggleButton;
