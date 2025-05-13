import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit as fbLimit,
  getDoc,
  updateDoc,
  addDoc,
  setDoc,
  Timestamp,
  increment,
  deleteField,
} from "firebase/firestore";
import { FIREBASE_DB } from "../firebaseconfig";
import { IMessage } from "../interfaces/chat-interface";
import { getRoomId } from "../utils/chat-utils";
import { useAuth } from "./auth-context";
import { LayoutAnimation, Platform, UIManager } from "react-native";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
export const MOVE_ONLY = {
  duration: 300,
  create: {
    type: LayoutAnimation.Types.easeIn, // opacity fade-in
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.spring, // bouncy reposition
    springDamping: 0.6,
  },
  delete: {
    type: LayoutAnimation.Types.easeOut, // fade-out on removals
    property: LayoutAnimation.Properties.opacity,
  },
};
const MESSAGE_LIMIT = 20;

/**
 * Chat list context: manages rooms, last messages, and unread counts
 */
interface ChatListContextProps {
  rooms: Array<{ key: string; roomId: string; type: "user" | "group" }>;
  lastMessages: Record<string, IMessage | null>;
  unreadCounts: Record<string, number>;
  initializeRooms: () => void;
  removeRoom: (key: string) => void;
  registerUnsub: (unsub: () => void) => void;
  clearAllListeners: () => void;
}
const ChatListContext = createContext<ChatListContextProps | undefined>(
  undefined
);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { mongoUser, setMongoUser } = useAuth();

  const [rooms, setRooms] = useState<ChatListContextProps["rooms"]>([]);
  const [lastMessages, setLastMessages] = useState<
    Record<string, IMessage | null>
  >({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  // keep track of every onSnapshot unsub
  const snapshotUnsubs = useRef<(() => void)[]>([]);

  // helper to register one more unsub
  const registerUnsub = (unsub: () => void) => {
    snapshotUnsubs.current.push(unsub);
  };

  // helper to clear them all at once
  const clearAllListeners = useCallback(() => {
    // 1) tear down any live Firestore listeners
    snapshotUnsubs.current.forEach((u) => u());
    snapshotUnsubs.current = [];

    // 2) reset your chat‐list state
    setRooms([]);
    setLastMessages({});
    setUnreadCounts({});
  }, [setRooms, setLastMessages, setUnreadCounts]);

  useEffect(() => {
    if (!mongoUser) {
      clearAllListeners();
    }
  }, [mongoUser, clearAllListeners]);

  // Initialize rooms once when user data arrives
  const initializeRooms = useCallback(() => {
    if (!mongoUser || rooms.length) return;
    const uRooms = mongoUser.chatrooms_with.map((u) => ({
      key: u._id,
      roomId: getRoomId(mongoUser.firebase_id, u.firebase_id!),
      type: "user" as const,
    }));
    const gRooms = mongoUser.chatrooms_groups.map((g) => ({
      key: g._id,
      roomId: g._id,
      type: "group" as const,
    }));
    setRooms([...uRooms, ...gRooms]);
  }, [mongoUser, rooms.length]);

  // Subscribe to unread counts for each room
  useEffect(() => {
    if (!rooms.length || !mongoUser) return;
    const countsInit: Record<string, number> = {};
    rooms.forEach((r) => (countsInit[r.key] = 0));
    setUnreadCounts(countsInit);

    const unsubs = rooms.map((r) =>
      onSnapshot(doc(FIREBASE_DB, "rooms", r.roomId), (snap) => {
        const parts = snap.data()?.participants as Record<string, number>;
        if (!parts) return;
        setUnreadCounts((prev) => ({
          ...prev,
          [r.key]: parts[mongoUser._id] || 0,
        }));
      })
    );
    for (const unsub of unsubs) {
      registerUnsub(unsub);
    }
    return () => unsubs.forEach((u) => u());
  }, [rooms, mongoUser]);

  // Subscribe to last message for each room
  useEffect(() => {
    if (!rooms.length) return;
    const initMap: Record<string, IMessage | null> = {};
    rooms.forEach((r) => (initMap[r.key] = null));
    setLastMessages(initMap);

    const unsubs = rooms.map((r) => {
      const q = query(
        collection(doc(FIREBASE_DB, "rooms", r.roomId), "messages"),
        orderBy("createdAt", "desc"),
        fbLimit(1)
      );
      return onSnapshot(q, (snap) => {
        LayoutAnimation.configureNext(MOVE_ONLY);
        const msg = snap.docs[0]?.data() as IMessage | undefined;
        setLastMessages((prev) => ({ ...prev, [r.key]: msg ?? null }));
      });
    });
    for (const unsub of unsubs) {
      registerUnsub(unsub);
    }
    return () => unsubs.forEach((u) => u());
  }, [rooms]);

  useEffect(() => {
    if (!mongoUser) return;

    // Build the new list from mongoUser
    const uRooms = mongoUser.chatrooms_with.map((u) => ({
      key: u._id,
      roomId: getRoomId(mongoUser.firebase_id, u.firebase_id!),
      type: "user" as const,
    }));
    const gRooms = mongoUser.chatrooms_groups.map((g) => ({
      key: g._id,
      roomId: g._id,
      type: "group" as const,
    }));
    const allRooms = [...uRooms, ...gRooms];

    // Merge into existing state, preserving order plus additions
    setRooms((prev) => {
      const existingKeys = new Set(prev.map((r) => r.key));
      // any new rooms?
      const additions = allRooms.filter((r) => !existingKeys.has(r.key));
      // if none new, keep prev; otherwise append additions
      return additions.length ? [...prev, ...additions] : prev;
    });
  }, [mongoUser]);

  const removeRoom = useCallback(
    async (key: string) => {
      setRooms((prev) => prev.filter((r) => r.key !== key));
      if (!mongoUser) return;
      const existingGroup = mongoUser.chatrooms_groups.find(
        (g) => g._id === key
      );
      if (existingGroup) {
        setMongoUser({
          ...mongoUser,
          chatrooms_groups: mongoUser.chatrooms_groups.filter(
            (g) => g._id !== key
          ),
        });

        // Remove participant from Firestore room document
        const roomRef = doc(FIREBASE_DB, "rooms", existingGroup._id);
        await updateDoc(roomRef, {
          [`participants.${mongoUser._id}`]: deleteField(),
        });
      }
    },
    [mongoUser]
  );

  return (
    <ChatListContext.Provider
      value={{
        rooms,
        lastMessages,
        unreadCounts,
        initializeRooms,
        removeRoom,
        registerUnsub,
        clearAllListeners,
      }}
    >
      {children}
    </ChatListContext.Provider>
  );
};

export const useChatList = (): ChatListContextProps => {
  const ctx = useContext(ChatListContext);
  if (!ctx) throw new Error("useChatList must be used within ChatProvider");
  return ctx;
};

/**
 * Hook for chat room functionality: messages stream, sending, and clearing unread
 */
interface ChatRoomOptions {
  type: "user" | "group";
  userUid?: string;
  userMongoId?: string;
  groupId?: string;
}
export const useChatRoom = ({
  type,
  userUid,
  groupId,
  userMongoId,
}: ChatRoomOptions) => {
  const { mongoUser } = useAuth();
  const roomId =
    type === "user" ? getRoomId(mongoUser!.firebase_id, userUid!) : groupId!;
  const [messages, setMessages] = useState<IMessage[]>([]);

  // Subscribe to cached + initial batch
  useEffect(() => {
    const roomRef = doc(FIREBASE_DB, "rooms", roomId);
    const messagesRef = collection(roomRef, "messages");
    const loadQ = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      fbLimit(MESSAGE_LIMIT)
    );
    const unsubLoad = onSnapshot(loadQ, (snap) => {
      const all = snap.docs.map((d) => d.data() as IMessage).reverse();
      setMessages(all);
    });

    const newQ = query(messagesRef, orderBy("createdAt", "desc"), fbLimit(1));
    const unsubNew = onSnapshot(newQ, (snap) => {
      const msg = snap.docs[0]?.data() as IMessage | undefined;
      if (!msg) return;
      LayoutAnimation.configureNext(MOVE_ONLY);
      setMessages((prev) =>
        prev.some(
          (m) =>
            m.userId === msg.userId &&
            m.createdAt.seconds === msg.createdAt.seconds &&
            m.text === msg.text
        )
          ? prev
          : [...prev, msg]
      );
    });

    return () => {
      unsubLoad();
      unsubNew();
    };
  }, [roomId]);

  // Create room if needed and clear unread on mount
  useEffect(() => {
    (async () => {
      const roomRef = doc(FIREBASE_DB, "rooms", roomId);
      const snap = await getDoc(roomRef);
      const memberIds =
        type === "user"
          ? [mongoUser!._id, userMongoId!]
          : // for groups, assume members already exist in group document
            [];
      if (!snap.exists()) {
        const initialMap = memberIds.reduce(
          (acc, uid) => ({ ...acc, [uid]: 0 }),
          {} as Record<string, number>
        );
        await setDoc(roomRef, {
          roomId,
          createdAt: Timestamp.fromDate(new Date()),
          participants: initialMap,
        });
      }
      // clear my unread
      await updateDoc(roomRef, {
        [`participants.${mongoUser!._id}`]: 0,
      });
    })();
  }, [roomId]);

  // Send message and bump unread + push
  const sendMessage = useCallback(
    async (text: string) => {
      const roomRef = doc(FIREBASE_DB, "rooms", roomId);
      const messagesRef = collection(roomRef, "messages");

      await addDoc(messagesRef, {
        userId: mongoUser!.firebase_id,
        senderName: mongoUser!.username,
        text,
        createdAt: Timestamp.fromDate(new Date()),
      });
      const snap = await getDoc(roomRef);
      const parts = snap.data()!.participants as Record<string, number>;
      const updates: Record<string, any> = {};
      Object.keys(parts).forEach((uid) => {
        if (uid !== mongoUser!._id)
          updates[`participants.${uid}`] = increment(1);
      });
      await updateDoc(roomRef, updates);

      // push logic left to individual screens or separate helper
    },
    [roomId, mongoUser]
  );

  // Clear unread manually
  const clearUnread = useCallback(async () => {
    const roomRef = doc(FIREBASE_DB, "rooms", roomId);
    await updateDoc(roomRef, { [`participants.${mongoUser!._id}`]: 0 });
  }, [roomId, mongoUser]);

  return { messages, sendMessage, clearUnread };
};

export default ChatProvider;
