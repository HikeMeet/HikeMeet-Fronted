// ChatListPage.tsx
import React, { useEffect, useMemo } from "react";
import { View, Text, FlatList, LayoutAnimation } from "react-native";
import { useAuth } from "../../contexts/auth-context";
import ChatItem from "./components.tsx/chat-item";
import type { IUser } from "../../interfaces/post-interface";

export default function ChatListPage({ navigation }: { navigation: any }) {
  const { mongoUser, chatActivity } = useAuth();

  // Trigger a layout animation any time chatActivity changes
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [chatActivity]);

  // Sort your chat list by the latest timestamp from chatActivity
  const sorted = useMemo(() => {
    if (!mongoUser) return [];
    return [...mongoUser.chatrooms_with].sort((a, b) => {
      const ta = chatActivity[a._id] || 0;
      const tb = chatActivity[b._id] || 0;
      return tb - ta;
    });
  }, [mongoUser, chatActivity]);

  return (
    <View className="flex-1 bg-white">
      <View className="py-4 px-6 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-800">Chat Rooms</Text>
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ChatItem
            user={item}
            navigation={navigation}
            onPress={() =>
              navigation.push("ChatStack", {
                screen: "ChatRoomPage",
                params: { user: item },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">No chats yet</Text>
          </View>
        }
      />
    </View>
  );
}
