// src/components/chat/components/MessageItem.tsx
import React from "react";
import { View, Text } from "react-native";
import { MongoUser } from "../../../interfaces/user-interface";
import { IMessage } from "../../../interfaces/chat-interface";
import { formatDate } from "../../../utils/chat-utils";
import LtrText from "../../../components/ltr-text";

interface MessageItemProps {
  message?: IMessage;
  currentUser?: MongoUser;
  type: "user" | "group";
}

export default function MessageItem({
  message,
  currentUser,
  type,
}: MessageItemProps) {
  if (!message) return null;

  const isMine = currentUser?.firebase_id === message.userId;
  const timeText = formatDate(message.createdAt.toDate());

  // Alignment
  const containerStyle = isMine
    ? "flex-row justify-end pr-4 mb-3"
    : "flex-row justify-start pl-4 mb-3";

  // Bubble styling
  const bubbleBase = "px-4 py-2 max-w-3/4";
  const mineBubble = "bg-blue-500 rounded-2xl rounded-tr-sm";
  const otherBubble =
    "bg-white border border-gray-300 rounded-2xl rounded-tl-sm";

  // Text colors
  const textColor = isMine ? "text-white" : "text-gray-800";

  // Timestamps: high-contrast for mine, muted for others
  const timeColor = isMine ? "text-gray-500" : "text-gray-500";

  return (
    <View className={containerStyle}>
      <View>
        {/* Sender name for group chats */}
        {type === "group" && !isMine && (
          <LtrText className="text-[12px] font-medium text-indigo-600 mb-0.5 ml-1">
            {message.senderName}
          </LtrText>
        )}

        {/* Bubble */}
        <View className={`${bubbleBase} ${isMine ? mineBubble : otherBubble}`}>
          <LtrText className={`${textColor} text-base`}>{message.text}</LtrText>
        </View>

        {/* Timestamp below */}
        <LtrText
          className={`mt-0.5 text-[10px] ${timeColor} ${
            isMine ? "text-right pr-1" : "text-left pl-1"
          }`}
        >
          {timeText}
        </LtrText>
      </View>
    </View>
  );
}
