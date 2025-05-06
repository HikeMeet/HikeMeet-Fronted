// components/chat/components/chat-item.tsx
import React, { useEffect, useRef } from "react";
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
  const { mongoId } = useAuth();
  const ref = useRef<View>(null);

  // Animate when this item is laid out (e.g., moves position)
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

  return (
    <View ref={ref} onLayout={handleLayout}>
      <TouchableOpacity
        onPress={onPress}
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
    </View>
  );
};

export default ChatItem;
