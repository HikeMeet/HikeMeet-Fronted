import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import ChatItem from "./components.tsx/chat-item";

// enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ChatListPage({ navigation }: any) {
  const { mongoUser, chatActivity } = useAuth();
  const [query, setQuery] = useState("");

  // animate whenever chatActivity changes
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [chatActivity]);

  // sort chats by last‐activity
  const sorted = useMemo(() => {
    if (!mongoUser) return [];
    return [...mongoUser.chatrooms_with].sort((a, b) => {
      const ta = chatActivity[a._id] || 0;
      const tb = chatActivity[b._id] || 0;
      return tb - ta;
    });
  }, [mongoUser, chatActivity]);

  // filter by username
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((u) => u.username.toLowerCase().includes(q));
  }, [sorted, query]);

  return (
    <View className="flex-1 bg-white">
      <View className="py-4 px-6 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-800">Chat Rooms</Text>
        {/* Search bar */}
        <TextInput
          className="mt-2 px-3 py-2 bg-gray-100 rounded-lg"
          placeholder="Search chats..."
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={filtered}
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
            <Text className="text-gray-500">
              {query ? "No matching chats" : "No chats yet"}
            </Text>
          </View>
        }
      />
    </View>
  );
}
