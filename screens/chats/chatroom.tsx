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
  const insets = useSafeAreaInsets();
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
    // Firestore
    const roomSnap = await getDoc(doc(FIREBASE_DB, "rooms", roomId));
    if (!roomSnap.exists()) {
      await setDoc(doc(FIREBASE_DB, "rooms", roomId), {
        roomId,
        createdAt: Timestamp.fromDate(new Date()),
      });
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
  useEffect(() => {
    createRoomIfNotExists();

    const docRef = doc(FIREBASE_DB, "rooms", roomId);
    const messagesRef = collection(docRef, "messages");

    // initial load (latest 20)
    const loadQ = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(messagesLimit)
    );
    const unsubLoad = onSnapshot(loadQ, (snap) => {
      const all: IMessage[] = snap.docs
        .map((d) => d.data() as IMessage)
        .reverse();
      setMessages(all);
    });

    // new messages listener
    const newQ = query(messagesRef, orderBy("createdAt", "desc"), limit(1));
    const unsubNew = onSnapshot(newQ, (snap) => {
      if (!snap.empty) {
        const msg = snap.docs[0].data() as IMessage;
        // animate insertion
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages((prev) => {
          // avoid dupes
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
      }
    });

    return () => {
      unsubLoad();
      unsubNew();
    };
  }, [roomId]);

  // handle send
  const handleSendMessage = async () => {
    const text = textRef.current.trim();
    if (!text) return;

    textRef.current = "";
    inputRef.current?.clear();

    try {
      const docRef = doc(FIREBASE_DB, "rooms", roomId);
      const messagesRef = collection(docRef, "messages");
      await addDoc(messagesRef, {
        userId: mongoUser!.firebase_id,
        senderName: mongoUser!.username,
        text,
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

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
      <View
        style={{
          padding: 12,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderColor: "#ddd",
          paddingBottom: Platform.OS === "ios" ? 0 : insets.bottom,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f1f1f1",
            borderRadius: 24,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <TextInput
            ref={inputRef}
            style={{ flex: 1, color: "#333" }}
            placeholder="Type a message"
            onChangeText={(v) => (textRef.current = v)}
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
          />
          <TouchableOpacity onPress={handleSendMessage}>
            <Text style={{ color: "#007AFF", fontWeight: "600" }}>Send</Text>
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
