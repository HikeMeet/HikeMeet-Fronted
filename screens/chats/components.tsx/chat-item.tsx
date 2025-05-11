// components/chat/components/ChatItem.tsx
import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  Image,
  Platform,
  UIManager,
} from "react-native";
import { IUser } from "../../../interfaces/post-interface";
import { IGroup } from "../../../interfaces/group-interface";
import { IMessage } from "../../../interfaces/chat-interface";
import { formatDate } from "../../../utils/chat-utils";
import ConfirmationModal from "../../../components/confirmation-modal";
import {
  closeChatroom,
  closeGroupChatroom,
} from "../../../components/requests/chats-requsts";
import { useAuth } from "../../../contexts/auth-context";

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

  const handleProfilePress = () => {
    if (type === "user") {
      if (user!._id === mongoId) {
        navigation.push("Tabs", { screen: "Profile" });
      } else {
        navigation.push("AccountStack", {
          screen: "UserProfile",
          params: { userId: user!._id },
        });
      }
    } else {
      navigation.navigate("GroupsStack", {
        screen: "GroupPage",
        params: { groupId: group!._id },
      });
    }
  };

  return (
    <Pressable
      onPress={() => {
        navigation.push("ChatStack", {
          screen: "ChatRoomPage",
          params: {
            type: type, // 🚀 NEW
            ...(type === "user" ? { user: user } : { group: group }),
          },
        });
      }}
      onLongPress={confirmDelete}
      android_ripple={{ color: "#ddd" }}
      style={({ pressed }) => [
        { backgroundColor: pressed ? "#f0f0f0" : "white" },
      ]}
      className="flex-row items-center p-4 border-b border-gray-200"
    >
      <Pressable onPress={handleProfilePress}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-300" />
        )}
      </Pressable>

      <View className="ml-4 flex-1">
        <View className="flex-row items-center justify-between">
          {/* Title: will shrink if needed */}
          <Text
            numberOfLines={1}
            className="flex-1 text-base font-semibold text-gray-800 truncate"
          >
            {title}
          </Text>
          {/* Time: flex-none so never shrinks */}
          <Text className="shrink-0 text-sm font-semibold text-gray-600 ml-2 min-w-[48px] text-right">
            {renderTime()}
          </Text>
          {/* ─── badge ─── */}
          {unreadCount > 0 && (
            <View className="ml-2 bg-red-500 rounded-full w-5 h-5 justify-center items-center">
              <Text className="text-white text-xs font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-600 mt-1">{renderLast()}</Text>
      </View>

      <ConfirmationModal
        visible={confirmVisible}
        message={
          type === "user"
            ? `Are you sure you want to remove ${title}?`
            : `Are you sure you want to leave group chat "${title}"?`
        }
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </Pressable>
  );
};

export default ChatItem;
