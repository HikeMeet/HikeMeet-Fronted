// screens/chat/ChatRoomPage.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  Keyboard,
  InputAccessoryView,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import { getRoomId } from "../../utils/chat-utils";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  limit,
  updateDoc,
  increment,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseconfig";
import { IMessage } from "../../interfaces/chat-interface";
import {
  openChatroom,
  openGroupChatroom,
} from "../../components/requests/chats-requsts";
import { IUser } from "../../interfaces/post-interface";
import { Group, IGroup } from "../../interfaces/group-interface";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MessagesList from "./components.tsx/messages-list";
import { MongoUser } from "../../interfaces/user-interface";
import { sendPushNotification } from "../../components/requests/notification-requsts";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ChatRoomPageProps {
  route: {
    params: { type: "user"; user: IUser } | { type: "group"; group: IGroup };
  };
  navigation: any;
}

const messagesLimit = 20;

const ChatRoomPage: React.FC<ChatRoomPageProps> = ({ route, navigation }) => {
  const { type } = route.params;
  const userParam = (route.params as any).user as IUser | undefined;
  const groupParam = (route.params as any).group as IGroup | undefined;
  const [groupData, setGroupData] = useState<Group | null>(null);
  const [loadingGroup, setLoadingGroup] = useState<boolean>(false);
  const { mongoId, mongoUser, getToken } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const textRef = useRef("");
  const inputRef = useRef<TextInput | null>(null);
  const inputAccessoryViewID = "uniqueID";
  // compute a single roomId for both types:
  const roomId =
    type === "user"
      ? getRoomId(mongoUser!.firebase_id, userParam!.firebase_id!)
      : groupParam!._id;

  const isMember =
    type === "user"
      ? true
      : !!groupData?.members.some((m) => m.user === mongoId);
  // create Firestore room + call backend openChatroom/openGroupChatroom
  const createRoomIfNotExists = async () => {
    const roomRef = doc(FIREBASE_DB, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    // make sure we only ever get a string[]
    const memberIds: string[] =
      type === "user"
        ? [mongoUser!.firebase_id, userParam!.firebase_id!]
        : groupData
          ? groupData.members.map((m) => m.user)
          : [];

    if (!roomSnap.exists()) {
      // seed participants to zero
      const initialMap = memberIds.reduce(
        (acc, uid) => {
          acc[uid] = 0;
          return acc;
        },
        {} as Record<string, number>
      );

      await setDoc(roomRef, {
        roomId,
        createdAt: Timestamp.fromDate(new Date()),
        participants: initialMap,
      });
    } else {
      const existing = roomSnap.data()!.participants as Record<string, number>;
      const toAdd = memberIds.filter((uid) => existing[uid] === null);
      if (toAdd.length) {
        // build an update object like { "participants.newUid": 0, ... }
        const upd: Record<string, any> = {};
        toAdd.forEach((uid) => {
          upd[`participants.${uid}`] = 0;
        });
        await updateDoc(roomRef, upd);
      }
    }
    // backend
    const token = await getToken();
    if (!token) return;
    if (type === "user") {
      await openChatroom(userParam!._id!, token);
    } else {
      await openGroupChatroom(groupParam!._id, token);
    }
  };

  useEffect(() => {
    if (type !== "group") return;
    setLoadingGroup(true);
    fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/${roomId}`)
      .then((res) => res.json())
      .then((body: { group: Group }) => setGroupData(body.group))
      .catch(console.error)
      .finally(() => setLoadingGroup(false));
  }, [type, roomId]);

  // subscribe to messages
  // 1) ALWAYS subscribe *first* — this will render cached messages instantly,
  //    then deliver the initial 20 as soon as Firestore has them.
  useEffect(() => {
    const roomRef = doc(FIREBASE_DB, "rooms", roomId);
    const messagesRef = collection(roomRef, "messages");

    const loadQ = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(messagesLimit)
    );
    const unsubLoad = onSnapshot(loadQ, (snap) => {
      const all = snap.docs.map((d) => d.data() as IMessage).reverse();
      setMessages(all);
    });

    const newQ = query(messagesRef, orderBy("createdAt", "desc"), limit(1));
    const unsubNew = onSnapshot(newQ, (snap) => {
      if (snap.empty) return;
      const msg = snap.docs[0].data() as IMessage;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((prev) => {
        if (
          prev.some(
            (m) =>
              m.userId === msg.userId &&
              m.createdAt.seconds === msg.createdAt.seconds &&
              m.text === msg.text
          )
        ) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    return () => {
      unsubLoad();
      unsubNew();
    };
  }, [roomId]);

  // 2) THEN, in parallel, ensure the room exists and clear your unread:
  useEffect(() => {
    (async () => {
      await createRoomIfNotExists();
      const roomRef = doc(FIREBASE_DB, "rooms", roomId);
      updateDoc(roomRef, {
        [`participants.${mongoUser!.firebase_id}`]: 0,
      }).catch(console.error);
    })();
  }, [roomId]);
  // inside ChatRoomPage, after you have roomId & mongoId:
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      try {
        const roomRef = doc(FIREBASE_DB, "rooms", roomId);
        // reset your unread count
        await updateDoc(roomRef, {
          [`participants.${mongoUser!.firebase_id}`]: 0,
        });
      } catch (err) {
        console.error("Failed to clear unread on leave:", err);
      }
      // allow the navigation to proceed
    });

    return unsubscribe;
  }, [navigation, roomId, mongoId]);

  // handle send
  const handleSendMessage = async () => {
    const text = textRef.current.trim();
    if (!text) return;

    // clear the input immediately
    textRef.current = "";
    inputRef.current?.clear();

    try {
      const roomRef = doc(FIREBASE_DB, "rooms", roomId);
      const messagesRef = collection(roomRef, "messages");

      // 1) add the actual message
      await addDoc(messagesRef, {
        userId: mongoUser!.firebase_id,
        senderName: mongoUser!.username,
        text,
        createdAt: Timestamp.fromDate(new Date()),
      });

      // 2) fetch the current participants map
      const snap = await getDoc(roomRef);
      const parts = snap.data()!.participants as Record<string, number>;

      // 3) build an update object that increments everyone else's counter
      const updates: Record<string, any> = {};
      Object.keys(parts).forEach((uid) => {
        if (uid !== mongoUser!.firebase_id) {
          updates[`participants.${uid}`] = increment(1);
        }
      });

      // 4) apply it
      await updateDoc(roomRef, updates);

      // ── NEW: send Expo push notifications ──
      // Determine who should get notified
      const recipientMongoIds =
        type === "user"
          ? [userParam!._id]
          : groupData!.members.map((m) => m.user);
      // Exclude sender
      const targets = recipientMongoIds.filter((id) => id !== mongoUser!._id);

      // Fetch each user’s pushTokens from your Mongo API
      const fetches = targets.map(async (id) =>
        fetch(`${process.env.EXPO_LOCAL_SERVER}/api/user/${id}`, {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }).then((r) => r.json() as Promise<MongoUser>)
      );
      const usersData = await Promise.all(fetches);
      const expoTokens = usersData.flatMap((u) => u.pushTokens);

      // Fire off the push
      if (expoTokens.length) {
        await sendPushNotification(
          expoTokens,
          `${mongoUser!.username} sent you a message`,
          text,
          {
            navigation: {
              name: "Tabs",
              params: {
                screen: "Chats",
              },
            },
          }
        );
      }
    } catch (err: any) {
      Alert.alert("Error sending message", err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", async () => {
      const roomRef = doc(FIREBASE_DB, "rooms", roomId);
      try {
        await updateDoc(roomRef, {
          [`participants.${mongoUser!.firebase_id}`]: 0,
        });
      } catch (e) {
        console.error("Failed to clear unread on blur:", e);
      }
    });

    return unsubscribe;
  }, [navigation, roomId, mongoId]);
  const handleProfileImagePress = () => {
    if (type === "user") {
      if (userParam!._id === mongoId) {
        navigation.push("Tabs", { screen: "Profile" });
      } else {
        navigation.push("AccountStack", {
          screen: "UserProfile",
          params: { userId: userParam!._id },
        });
      }
    } else {
      // maybe open group settings screen
      navigation.navigate("GroupsStack", {
        screen: "GroupPage",
        params: { groupId: groupParam!._id },
      });
    }
  };

  // render input bar (same as before)
  const renderInputBar = () => {
    const inputBar = (
      <View className="px-3 py-2 bg-white border-t border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1">
          <TextInput
            ref={inputRef}
            className="flex-1 text-gray-700"
            placeholder="Type a message"
            onChangeText={(v) => (textRef.current = v)}
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
          />
          <TouchableOpacity onPress={handleSendMessage}>
            <Text className="text-blue-500 font-semibold">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    if (Platform.OS === "ios") {
      return (
        <>
          {inputBar}
          <InputAccessoryView nativeID={inputAccessoryViewID}>
            {inputBar}
          </InputAccessoryView>
        </>
      );
    }
    return inputBar;
  };

  const title =
    type === "user"
      ? userParam!.username
      : loadingGroup
        ? "Loading…"
        : (groupData?.name ?? "Unknown Group");

  const avatarUrl =
    type === "user"
      ? userParam!.profile_picture.url
      : groupData?.main_image?.url;
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center p-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={handleProfileImagePress}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-300" />
          )}
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: "600" }}>
          {title}
        </Text>
      </View>

      {/* Messages */}
      {type === "group" && !isMember && !loadingGroup ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-500 text-center">
            You must join this group before you can see its messages.
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("GroupsStack", {
                screen: "GroupPage",
                params: { groupId: groupParam!._id },
              })
            }
            className="flex-row items-center bg-blue-600 px-4 py-2 rounded"
          >
            <Text className="text-white font-medium ml-2">View Group</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <MessagesList
          messages={messages}
          roomId={roomId}
          messagesLimit={messagesLimit}
          type={type}
        />
      )}

      {/* Input */}
      {type === "group" && !loadingGroup && !isMember ? (
        <View className="px-4 py-3 bg-gray-200">
          <Text className="text-center text-gray-600">
            You must join the group to read or send messages.
          </Text>
        </View>
      ) : (
        renderInputBar()
      )}
    </SafeAreaView>
  );
};

export default ChatRoomPage;
