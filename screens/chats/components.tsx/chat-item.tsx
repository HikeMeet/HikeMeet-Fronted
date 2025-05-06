// components/chat/components/chat-item.tsx
import React, { useState, useRef } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { IUser } from "../../../interfaces/post-interface";
import { useAuth } from "../../../contexts/auth-context";
import { formatDate } from "../../../utils/chat-utils";
import { IMessage } from "../../../interfaces/chat-interface";
import ConfirmationModal from "../../../components/confirmation-modal";
import { closeChatroom } from "../../../components/requests/chats-requsts";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ChatItemProps {
  user: IUser;
  lastMessage?: IMessage | null;
  navigation: any;
  onPress?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  user,
  lastMessage,
  onPress,
  navigation,
}) => {
  const { mongoId, getToken, setMongoUser, mongoUser } = useAuth();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const renderTime = () => {
    if (lastMessage) {
      return formatDate(new Date(lastMessage.createdAt.seconds * 1000));
    }
    return "";
  };

  const renderLastMessage = () => {
    if (lastMessage === undefined) return "Loading...";
    if (lastMessage === null) return "Say Hi 👋";
    const prefix = mongoId === lastMessage.userId ? "You: " : "";
    return prefix + lastMessage.text;
  };

  const handleProfileImagePress = () => {
    if (user._id === mongoId) {
      navigation.push("Tabs", { screen: "Profile" });
    } else {
      navigation.push("AccountStack", {
        screen: "UserProfile",
        params: { userId: user._id },
      });
    }
  };

  const confirmDelete = () => {
    setConfirmVisible(true);
  };

  const onCancel = () => setConfirmVisible(false);

  const onConfirm = async () => {
    setConfirmVisible(false);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await closeChatroom(user._id, token);
      console.log("Chat deleted");

      // Remove chat from context immediately
      if (mongoUser) {
        setMongoUser({
          ...mongoUser,
          chatrooms_with: mongoUser.chatrooms_with.filter(
            (u) => u._id !== user._id
          ),
        });
      }
      // Optionally, navigate or refresh parent list
    } catch (err) {
      console.error(err);
      // Optionally show error feedback
    }
  };

  return (
    <View onLayout={handleLayout}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={confirmDelete}
        className="flex-row items-center p-4 bg-white border-b border-gray-200"
      >
        <TouchableOpacity onPress={handleProfileImagePress}>
          {user.profile_picture.url ? (
            <Image
              source={{ uri: user.profile_picture.url }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-300" />
          )}
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <View className="flex-row justify-between">
            <Text className="text-base font-semibold text-gray-800">
              {user.username}
            </Text>
            <Text className="text-sm font-semibold text-gray-600">
              {renderTime()}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mt-1">
            {renderLastMessage()}
          </Text>
        </View>
      </TouchableOpacity>

      <ConfirmationModal
        visible={confirmVisible}
        message={`Delete chat with ${user.username}?`}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </View>
  );
};

export default ChatItem;
