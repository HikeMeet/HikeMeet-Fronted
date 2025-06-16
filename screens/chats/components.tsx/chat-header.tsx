import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MuteToggleButton from "./mute-chat-togle";
import LtrText from "../../../components/ltr-text";

interface ChatHeaderProps {
  avatarUrl?: string;
  title: string;
  onBack: () => void;
  onAvatarPress: () => void;
  roomId: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  avatarUrl,
  title,
  onBack,
  onAvatarPress,
  roomId,
}) => (
  <View className="flex-row items-center py-3 px-4 bg-white border-b border-gray-200 shadow-md">
    <TouchableOpacity
      onPress={onBack}
      className="p-2"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon name="arrow-left" size={24} color="#374151" />
    </TouchableOpacity>

    <TouchableOpacity onPress={onAvatarPress} className="mx-3">
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} className="w-10 h-10 rounded-full" />
      ) : (
        <View className="w-10 h-10 rounded-full bg-gray-300" />
      )}
    </TouchableOpacity>

    <LtrText
      numberOfLines={1}
      className="flex-1 text-lg font-semibold text-gray-900"
    >
      {title}
    </LtrText>
    <MuteToggleButton roomId={roomId} />
  </View>
);

export default ChatHeader;
