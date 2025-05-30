// screens/chat/ChatRoomPage.tsx
import React, { useEffect, useRef } from "react";
import { getRoomId } from "../../utils/chat-utils";
import {
  SafeAreaView,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  InputAccessoryView,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import { useChatRoom } from "../../contexts/chat-context";
import MessagesList from "./components.tsx/messages-list";
import { IGroup } from "../../interfaces/group-interface";
import { IUser } from "../../interfaces/post-interface";
import { sendPushNotification } from "../../components/requests/notification-requsts";
import {
  fetchPushTokensUnmuted,
  openChatroom,
} from "../../components/requests/chats-requsts";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseconfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ChatHeader from "./components.tsx/chat-header";
import { handleProfilePress } from "./components.tsx/user-group-image-press";
import { MongoUser } from "../../interfaces/user-interface";

interface ChatRoomPageProps {
  route: {
    params: { type: "user"; user: IUser } | { type: "group"; group: IGroup };
  };
  navigation: any;
}

const inputAccessoryID = "chatInput";

export default function ChatRoomPage({ route, navigation }: ChatRoomPageProps) {
  const { type } = route.params;
  const userParam = (route.params as any).user as IUser | undefined;
  const groupParam = (route.params as any).group as IGroup | undefined;
  const { mongoUser, mongoId, getToken, setMongoUser } = useAuth();
  const [fullUserData, setFullUserData] = React.useState<MongoUser | null>(
    null
  );
  // load group metadata
  const [groupData, setGroupData] = React.useState<IGroup | null>(null);
  const [loadingGroup, setLoadingGroup] = React.useState(false);

  const title =
    type === "user"
      ? userParam!.username
      : loadingGroup
        ? "Loading..."
        : groupData?.name || "Group";
  const avatarUrl =
    type === "user"
      ? userParam!.profile_picture.url
      : groupData?.main_image?.url;

  const roomId =
    type === "user"
      ? getRoomId(mongoUser!.firebase_id, userParam!.firebase_id!)
      : groupParam!._id;

  useEffect(() => {
    const fetchData = async () => {
      if (type === "group") {
        setLoadingGroup(true);
        try {
          const response = await fetch(
            `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupParam!._id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch group data");
          }
          const { group } = await response.json();
          setGroupData(group);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingGroup(false);
        }
      } else if (type === "user") {
        try {
          const response = await fetch(
            `${process.env.EXPO_LOCAL_SERVER}/api/user/${userParam!._id}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          setFullUserData(data);
          // Process user data if needed
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchData();
  }, [type, groupParam, userParam]);

  // membership
  const isMember =
    type === "user" ||
    (!!groupData && groupData.members.some((m) => m.user === mongoUser!._id));

  // context hook
  const { messages, sendMessage, clearUnread } = useChatRoom({
    type,
    userUid: type === "user" ? userParam?.firebase_id : undefined,
    userMongoId: type === "user" ? userParam?._id : undefined,
    groupId: type === "group" ? groupParam?._id : undefined,
  });

  // ── NEW: clear my unread in Firestore whenever this screen is removed ──
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      try {
        const ref = doc(FIREBASE_DB, "rooms", roomId);
        await updateDoc(ref, {
          // reset your own count (keyed by firebase_id)
          [`participants.${mongoUser!._id}`]: 0,
        });
      } catch (err) {
        console.error("Failed to clear unread on exit:", err);
      }
      // once our async reset is kicked off, navigation will continue automatically
    });
    return unsubscribe;
  }, [navigation, roomId, mongoUser]);

  // clear unread on blur
  useEffect(() => {
    const unsub = navigation.addListener("blur", clearUnread);
    return unsub;
  }, [navigation, clearUnread]);

  // input refs
  const textRef = useRef("");
  const inputRef = useRef<TextInput>(null);

  const handleSend = async () => {
    const txt = textRef.current.trim();
    if (!txt) return;
    textRef.current = "";
    inputRef.current?.clear();
    try {
      if (type === "user" && userParam) {
        const token = await getToken();
        await openChatroom(userParam._id, token!);
        if (!mongoUser!.chatrooms_with.some((u) => u._id === userParam._id)) {
          setMongoUser({
            ...mongoUser!,
            chatrooms_with: [...mongoUser!.chatrooms_with, userParam],
          });
        }

        // Merge the full IUser object into mongoUser.chatrooms_with
        if (!mongoUser!.chatrooms_with.some((u) => u._id === userParam._id)) {
          setMongoUser({
            ...mongoUser!,
            chatrooms_with: [...mongoUser!.chatrooms_with, userParam],
          });
        }
      }
      await sendMessage(txt);
      // ── NEW: send Expo push notifications ──
      // Determine who should get notified
      const recipientMongoIds =
        type === "user"
          ? [userParam!._id]
          : (await getDoc(doc(FIREBASE_DB, "rooms", roomId))).data()!
                .participants
            ? Object.keys(
                (await getDoc(doc(FIREBASE_DB, "rooms", roomId))).data()!
                  .participants
              )
            : [];
      // Exclude sender
      const targets = recipientMongoIds.filter((id) => id !== mongoUser!._id);
      const token = await getToken();
      // 1) batch-fetch push tokens
      let expoTokens: string[];
      try {
        expoTokens = await fetchPushTokensUnmuted(token!, targets, roomId);
      } catch (e) {
        console.error("Failed to fetch push tokens:", e);
        expoTokens = [];
      }
      // 2) skip if muted or no tokens
      if (expoTokens.length > 0) {
        await sendPushNotification(
          expoTokens,
          `${mongoUser!.username} sent you a message`,
          txt,
          {
            type: "chat",
            navigation: {
              name: "Tabs",
              params: {
                screen: "Chats",
              },
            },
          }
        );
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const renderInput = () => {
    const bar = (
      <View className="px-2 py-2 bg-white">
        <View className="flex-row items-center">
          <TextInput
            ref={inputRef}
            className="flex-1 text-gray-800"
            placeholder="Type a message..."
            placeholderTextColor="#999"
            onChangeText={(v) => (textRef.current = v)}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 8,
              fontSize: 16,
              color: "#374151",
            }}
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryID : undefined
            }
          />

          <TouchableOpacity
            onPress={handleSend}
            className="ml-3"
            style={{
              backgroundColor: "#16a34a",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Icon name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
    if (Platform.OS === "ios") {
      return (
        <>
          {bar}
          <InputAccessoryView nativeID={inputAccessoryID}>
            {bar}
          </InputAccessoryView>
        </>
      );
    }
    return bar;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ChatHeader
        title={title}
        roomId={roomId}
        avatarUrl={avatarUrl}
        onBack={() => navigation.goBack()}
        onAvatarPress={() =>
          handleProfilePress({
            type,
            user: userParam,
            group: groupParam,
            mongoId: mongoUser!._id,
            navigation,
          })
        }
      />

      {type === "group" && !loadingGroup && !isMember ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-500 text-center">
            Join the group to view messages.
          </Text>
        </View>
      ) : (fullUserData?.friends?.some(
          (f: any) => f.id === mongoId && f.status === "blocked"
        ) ?? false) ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-500 text-center">
            You are blocked by the user.
          </Text>
        </View>
      ) : (
        <MessagesList
          messages={messages}
          roomId={roomId}
          messagesLimit={20}
          type={type}
        />
      )}
      {(type === "group" && !isMember) ||
      (fullUserData?.friends?.some(
        (f: any) => f.id === mongoId && f.status === "blocked"
      ) ??
        false)
        ? null
        : renderInput()}
    </SafeAreaView>
  );
}
