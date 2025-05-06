// screens/chat/ChatListPage.tsx
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
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseconfig";
import { IMessage } from "../../interfaces/chat-interface";
import { getRoomId } from "../../utils/chat-utils";
import ChatItem from "./components.tsx/chat-item";
import Ionicons from "react-native-vector-icons/Ionicons";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ChatListPage({ navigation }: any) {
  const { mongoUser } = useAuth();
  const [queryText, setQueryText] = useState("");
  const [messagesMap, setMessagesMap] = useState<
    Record<string, IMessage | null | undefined>
  >({});

  // Subscribe to last message per chat room
  useEffect(() => {
    if (!mongoUser) return;
    const unsubscribes = mongoUser.chatrooms_with.map((user) => {
      const roomId = getRoomId(mongoUser.firebase_id, user.firebase_id!);
      const docRef = doc(FIREBASE_DB, "rooms", roomId);
      const messagesRef = collection(docRef, "messages");
      const q = query(messagesRef, orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snapshot) => {
        const first = snapshot.docs[0]?.data() as IMessage | undefined;
        // Animate list transition on new message
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessagesMap((prev) => ({ ...prev, [user._id]: first ?? null }));
      });
      return unsub;
    });
    return () => unsubscribes.forEach((u) => u());
  }, [mongoUser]);

  // Animate on messagesMap change
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [messagesMap]);

  // Sort by last message time
  const sorted = useMemo(() => {
    if (!mongoUser) return [];
    return [...mongoUser.chatrooms_with].sort((a, b) => {
      const ma = messagesMap[a._id]?.createdAt?.seconds ?? 0;
      const mb = messagesMap[b._id]?.createdAt?.seconds ?? 0;
      return mb - ma;
    });
  }, [mongoUser, messagesMap]);

  // Filter by username
  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((u) => u.username.toLowerCase().includes(q));
  }, [sorted, queryText]);

  return (
    <View className="flex-1 bg-white">
      <View className="py-4 px-6 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-800">Chat Rooms</Text>
        <TextInput
          className="mt-2 px-3 py-2 bg-gray-100 rounded-lg"
          placeholder="Search chats..."
          value={queryText}
          onChangeText={setQueryText}
        />
        <View className="flex-row items-center mt-1">
          <Ionicons name="information-circle-outline" size={14} color="#888" />
          <Text className="text-xs italic text-gray-500 ml-1">
            Long press to remove chat from the list
          </Text>
        </View>
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
            lastMessage={messagesMap[item._id]}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">
              {queryText ? "No matching chats" : "No chats yet"}
            </Text>
          </View>
        }
      />
    </View>
  );
}
