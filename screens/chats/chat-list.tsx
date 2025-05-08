// screens/chat/ChatListPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  limit,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseconfig";
import { IMessage } from "../../interfaces/chat-interface";
import { getRoomId } from "../../utils/chat-utils";
import Ionicons from "react-native-vector-icons/Ionicons";
import ChatItem from "./components.tsx/chat-item";
import { IGroup } from "../../interfaces/group-interface";
import { useFocusEffect } from "@react-navigation/native";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
export const MOVE_ONLY = {
  duration: 200,
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    // no `property` field → animates layout (position) only
  },
};

export default function ChatListPage({ navigation }: any) {
  const { mongoUser } = useAuth();

  const [queryText, setQueryText] = useState("");
  const [messagesMap, setMessagesMap] = useState<
    Record<string, IMessage | null>
  >({});
  const [rooms, setRooms] = useState<
    { type: "user" | "group"; data: any; key: string; roomId: string }[]
  >([]); // 🚀 NEW: local rooms state

  // 1️⃣ If we get a `newRoom` param, append just that one room:
  // build rooms only on first mount
  useEffect(() => {
    if (!mongoUser || rooms.length > 0) return;

    const userRooms = mongoUser.chatrooms_with.map((u) => ({
      type: "user" as const,
      data: u,
      key: u._id,
      roomId: getRoomId(mongoUser.firebase_id, u.firebase_id!),
    }));

    const groupRooms = mongoUser.chatrooms_groups
      .filter((g): g is IGroup => typeof g === "object" && !!g._id)
      .map((g) => ({
        type: "group" as const,
        data: g,
        key: g._id,
        roomId: g._id,
      }));

    setRooms([...userRooms, ...groupRooms]);
  }, [mongoUser, rooms.length]);

  useFocusEffect(
    useCallback(() => {
      if (!mongoUser) return;

      setRooms((old) => {
        const existingKeys = new Set(old.map((r) => r.key));
        const toAdd = mongoUser.chatrooms_groups
          .filter((g) => !existingKeys.has(g._id))
          .map((g) => ({
            type: "group" as const,
            data: g,
            key: g._id,
            roomId: g._id,
          }));
        return toAdd.length ? [...old, ...toAdd] : old;
      });
    }, [mongoUser])
  );
  // 🚀 NEW: initialize rooms once on mount
  useEffect(() => {
    if (!mongoUser) return;
    if (rooms.length > 0) return;
    // userRooms is fine—each is an IUser
    const userRooms = mongoUser.chatrooms_with.map((u) => ({
      type: "user" as const,
      data: u,
      key: u._id,
      roomId: getRoomId(mongoUser.firebase_id, u.firebase_id!),
    }));

    // Only keep those chatrooms_groups entries that are objects with an _id
    const groupRooms = mongoUser.chatrooms_groups
      .filter((g): g is IGroup => typeof g === "object" && !!g._id)
      .map((g) => ({
        type: "group" as const,
        data: g,
        key: g._id,
        roomId: g._id,
      }));

    setRooms([...userRooms, ...groupRooms]);
  }, [mongoUser]);

  // subscribe to last‐message of each room; only depends on rooms
  useEffect(() => {
    if (rooms.length === 0) return;

    // 🚀 NEW: prime messagesMap so every key exists
    const initialMap: Record<string, IMessage | null> = {};
    rooms.forEach((r) => (initialMap[r.key] = null));
    setMessagesMap(initialMap);

    const unsubs = rooms.map((r) => {
      const q = query(
        collection(doc(FIREBASE_DB, "rooms", r.roomId), "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      return onSnapshot(q, (snap) => {
        // 🚀 NEW: only animate here
        LayoutAnimation.configureNext(MOVE_ONLY);
        const msg = snap.docs[0]?.data() as IMessage | undefined;
        setMessagesMap((prev) => ({ ...prev, [r.key]: msg ?? null }));
      });
    });

    return () => unsubs.forEach((u) => u());
  }, [rooms]); // 🚀 NEW: no longer ties to mongoUser directly

  const handleRemoveRoom = (type: "user" | "group", key: string) => {
    // 1) update local UI immediately
    setRooms((rs) => rs.filter((r) => r.type !== type || r.key !== key));
    // 2) (mongoUser) will be updated by the ChatItem itself via setMongoUser,
    //    and our rooms effect (on [mongoUser]) would normally re-run anyway.
  };

  // sort by last message time
  const sorted = useMemo(() => {
    return rooms.slice().sort((a, b) => {
      const ta = messagesMap[a.key]?.createdAt.seconds ?? 0;
      const tb = messagesMap[b.key]?.createdAt.seconds ?? 0;
      return tb - ta;
    });
  }, [rooms, messagesMap]);

  // filter by name, with crash‐proof try/catch
  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return sorted;

    try {
      return sorted.filter((r) => {
        // pick username or group name, default to key
        const raw =
          r.type === "user" ? r.data?.username : r.data?.name || r.key;

        // coerce to string
        const name = String(raw).toLowerCase();

        // safe search
        return name.includes(q);
      });
    } catch (err) {
      console.warn("ChatListPage filter crashed:", err);
      // if anything blows up, show the unfiltered, sorted list
      return sorted;
    }
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
        className=""
        extraData={messagesMap} // 🚀 NEW: ensure re-render on message arrival
        keyExtractor={(item) => `${item.type}-${item.key}`}
        renderItem={({ item }) => (
          <ChatItem
            type={item.type}
            user={item.type === "user" ? item.data : undefined}
            group={item.type === "group" ? item.data : undefined}
            lastMessage={messagesMap[item.key]}
            navigation={navigation}
            onDelete={() => handleRemoveRoom(item.type, item.key)}
            onPress={() =>
              navigation.push("ChatStack", {
                screen: "ChatRoomPage",
                params: {
                  type: item.type, // 🚀 NEW
                  ...(item.type === "user"
                    ? { user: item.data }
                    : { group: item.data }),
                },
              })
            }
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
