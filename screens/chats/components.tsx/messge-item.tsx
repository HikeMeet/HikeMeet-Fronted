// src/components/chat/components/MessageItem.tsx
import React from "react";
import { View, Text } from "react-native";
import { MongoUser } from "../../../interfaces/user-interface";
import { IMessage } from "../../../interfaces/chat-interface";
import { formatDate } from "../../../utils/chat-utils";

interface MessageItemProps {
  message?: IMessage;
  currentUser?: MongoUser;
  type: "user" | "group"; // new prop
}

export default function MessageItem({
  message,
  currentUser,
  type: chatType,
}: MessageItemProps) {
  if (!message) return null;

  const isMine = currentUser?.firebase_id === message.userId;
  const timeText = formatDate(message.createdAt.toDate());

  return (
    <View
      className={
        isMine ? "flex-row justify-end mb-3 mr-3" : "flex-row mb-3 ml-3"
      }
    >
      <View className="w-4/5">
        {/* In group chats, show senderName for others */}
        {chatType === "group" && !isMine && (
          <Text className="text-xs text-gray-500 mb-1 ml-1">
            {message.senderName}
          </Text>
        )}

        {/* Bubble */}
        <View
          className={
            isMine
              ? "self-end p-3 rounded-2xl bg-[#3498db]"
              : "self-start p-3 rounded-2xl bg-white"
          }
        >
          <Text className={isMine ? "text-white" : "text-black"}>
            {message.text}
          </Text>
        </View>

        {/* Timestamp */}
        <Text
          className={
            (isMine ? "self-end" : "self-start") +
            " mt-1 text-[10px] text-gray-400"
          }
        >
          {timeText}
        </Text>
      </View>
    </View>
  );
}
