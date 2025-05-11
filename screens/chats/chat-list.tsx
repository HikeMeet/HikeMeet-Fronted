// screens/chat/ChatListPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, FlatList } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ChatItem from "./components.tsx/chat-item";
import { useChatList } from "../../contexts/chat-context";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";

export default function ChatListPage({ navigation }: any) {
  const { mongoUser } = useAuth();
  const { rooms, lastMessages, unreadCounts, initializeRooms, removeRoom } =
    useChatList();
  const [query, setQuery] = useState("");

  useEffect(() => initializeRooms(), [initializeRooms]);
  useFocusEffect(React.useCallback(() => initializeRooms(), [initializeRooms]));

  const sorted = useMemo(
    () =>
      rooms
        .slice()
        .sort(
          (a, b) =>
            (lastMessages[b.key]?.createdAt.seconds ?? 0) -
            (lastMessages[a.key]?.createdAt.seconds ?? 0)
        ),
    [rooms, lastMessages]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((r) => {
      const raw =
        r.type === "user"
          ? mongoUser!.chatrooms_with.find((u) => u._id === r.key)?.username
          : mongoUser!.chatrooms_groups.find((g) => g._id === r.key)?.name;
      return raw?.toLowerCase().includes(q);
    });
  }, [sorted, query, mongoUser]);

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-bold">Chats</Text>
        <View className="mt-2 flex-row items-center bg-gray-100 rounded-lg px-3">
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            className="flex-1 px-2 py-1"
            placeholder="Search chats..."
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.key}
        extraData={[lastMessages, unreadCounts]}
        renderItem={({ item }) => (
          <ChatItem
            type={item.type}
            user={
              item.type === "user"
                ? mongoUser!.chatrooms_with.find((u) => u._id === item.key)
                : undefined
            }
            group={
              item.type === "group"
                ? mongoUser!.chatrooms_groups.find((g) => g._id === item.key)
                : undefined
            }
            lastMessage={lastMessages[item.key]}
            unreadCount={unreadCounts[item.key] || 0}
            onDelete={() => removeRoom(item.key)}
            navigation={navigation}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}
