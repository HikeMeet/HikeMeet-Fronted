// ParsedMentionText.tsx
import React from "react";
import { Text } from "react-native";
import { Friend } from "../../../interfaces/user-interface";
import { useAuth } from "../../../contexts/auth-context";

interface ParsedMentionTextProps {
  text: string;
  navigation?: any;
}

const ParsedMentionText: React.FC<ParsedMentionTextProps> = ({
  text,
  navigation,
}) => {
  const { mongoUser } = useAuth();
  const regex = /@(\w+)/g;
  const parts: Array<{ text: string; isMention: boolean; friendId?: string }> =
    [];
  let lastIndex = 0;
  let match;
  const friendList = mongoUser?.friends || [];

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        isMention: false,
      });
    }
    const username = match[1];
    let friendId: string | undefined;
    if (friendList.length > 0) {
      const friend = friendList.find(
        (f) =>
          f.data && f.data.username.toLowerCase() === username.toLowerCase()
      );
      if (friend && friend.data) {
        friendId = friend.data._id;
      }
    }
    parts.push({ text: match[0], isMention: true, friendId });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), isMention: false });
  }

  return (
    <Text className="text-base text-gray-700">
      {parts.map((part, index) =>
        part.isMention &&
        part.friendId &&
        navigation &&
        typeof navigation.push === "function" ? (
          <Text
            key={index}
            className="text-blue-500 underline"
            onPress={() =>
              navigation.push("AccountStack", {
                screen: "UserProfile",
                params: { userId: part.friendId },
              })
            }
          >
            {part.text}
          </Text>
        ) : (
          <Text key={index}>{part.text}</Text>
        )
      )}
    </Text>
  );
};

export default ParsedMentionText;
