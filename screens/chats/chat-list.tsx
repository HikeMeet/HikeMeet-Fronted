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
      <View className="bg-white shadow-sm">
        <View className="px-4 py-2">
          <Text className="text-2xl font-bold text-gray-900">Chats</Text>
        </View>

        <View className="px-4 pb-4">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search chats..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </View>
          <View className="flex-row items-center mt-1 text-xs text-gray-500">
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#9CA3AF"
            />
            <Text className="ml-1 text-xs text-gray-500">
              Long press on any chat to remove it
            </Text>
          </View>
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
