// components/chat/components/ChatItem.tsx
import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  Image,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { IUser } from "../../../interfaces/post-interface";
import { IGroup } from "../../../interfaces/group-interface";
import { IMessage } from "../../../interfaces/chat-interface";
import { formatDate, getRoomId } from "../../../utils/chat-utils";
import ConfirmationModal from "../../../components/confirmation-modal";
import {
  closeChatroom,
  closeGroupChatroom,
  muteChat,
  unmuteChat,
} from "../../../components/requests/chats-requsts";
import { useAuth } from "../../../contexts/auth-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { handleProfilePress } from "./user-group-image-press";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ChatItemProps {
  type: "user" | "group";
  user?: IUser;
  group?: IGroup;
  lastMessage?: IMessage | null;
  navigation: any;
  onPress?: () => void;
  onDelete?: () => void;
  unreadCount?: number;
}

const ChatItem: React.FC<ChatItemProps> = ({
  type,
  user,
  group,
  lastMessage,
  onDelete,
  navigation,
  onPress,
  unreadCount = 0,
}) => {
  const { mongoId, getToken, setMongoUser, mongoUser } = useAuth();
  const [confirmVisible, setConfirmVisible] = useState(false);
  // 🚀 REMOVED onLayout & extra animations here

  const title = type === "user" ? user!.username : group!.name;
  const avatarUrl =
    type === "user" ? user!.profile_picture.url : group!.main_image?.url;
  const roomId =
    type === "group"
      ? group!._id
      : getRoomId(mongoUser!.firebase_id, user!.firebase_id!);

  const isMuted = mongoUser!.muted_chats.includes(roomId);

  const renderTime = (): string => {
    if (lastMessage === undefined) return "…";
    if (lastMessage === null) return "--";
    // use our shared util
    return formatDate(lastMessage.createdAt.toDate());
  };

  const renderLast = () => {
    if (lastMessage === undefined) return "Loading…";
    if (lastMessage === null) return "No messages yet";
    const senderName = type === "group" ? lastMessage.senderName : "";
    const prefix =
      lastMessage.userId === mongoUser!.firebase_id
        ? "You: "
        : type === "group"
          ? `${senderName}: `
          : senderName;
    return prefix + lastMessage.text;
  };

  const confirmDelete = () => setConfirmVisible(true);
  const onCancel = () => setConfirmVisible(false);
  const onConfirm = async () => {
    setConfirmVisible(false);
    const token = await getToken();
    if (!token) return;

    if (type === "user") {
      await closeChatroom(user!._id, token);
    } else {
      await closeGroupChatroom(group!._id, token);
    }
    onDelete?.();
  };

  const toggleMute = async () => {
    const token = await getToken();

    try {
      // call the proper endpoint
      console.log("isMuted", roomId, isMuted);
      if (isMuted) {
        await unmuteChat(token!, roomId);
        setMongoUser((prev: any) => ({
          ...prev,
          muted_chats: prev.muted_chats.filter((id: string) => id !== roomId),
        }));
      } else {
        await muteChat(token!, roomId);
        setMongoUser((prev: any) => ({
          ...prev,
          muted_chats: [...prev.muted_chats, roomId],
        }));
      }
    } catch (e: any) {
      console.error("Mute toggle error:", e);
      Alert.alert("Error", e.message);
    }
  };

  return (
    <Pressable
      onPress={() => {
        navigation.push("ChatStack", {
          screen: "ChatRoomPage",
          params: {
            type,
            ...(type === "user" ? { user } : { group }),
          },
        });
      }}
      onLongPress={confirmDelete}
      android_ripple={{ color: "rgba(0,0,0,0.05)" }}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? "#f9fafb" : "#ffffff",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 6,
        },
      ]}
    >
      <View className="flex-row items-center px-4 py-3">
        {/* Avatar */}
        <Pressable
          onPress={() =>
            handleProfilePress({
              type,
              user: user,
              group: group,
              mongoId: mongoUser!._id,
              navigation,
            })
          }
          className="mr-4"
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gray-300" />
          )}
        </Pressable>

        {/* Main content */}
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-lg font-semibold text-gray-800"
          >
            {title}
          </Text>
          <Text numberOfLines={1} className="text-sm text-gray-500 mt-0.5">
            {renderLast()}
          </Text>
        </View>

        {/* Meta & controls */}
        <View className="flex-row items-center space-x-3">
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}

          {/* Timestamp */}
          <Text className="text-xs text-gray-400">{renderTime()}</Text>

          {/* Mute Toggle */}
          <Pressable
            onPress={toggleMute}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Icon
              name={isMuted ? "bell-off" : "bell"}
              size={22}
              color={isMuted ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>
        </View>
      </View>

      <ConfirmationModal
        visible={confirmVisible}
        message={
          type === "user"
            ? `Remove ${title} from your chats?`
            : `Leave group chat "${title}"?`
        }
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </Pressable>
  );
};

export default ChatItem;
