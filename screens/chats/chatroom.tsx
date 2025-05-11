// screens/chat/ChatRoomPage.tsx
import React, { useEffect, useRef } from "react";
import { getRoomId } from "../../utils/chat-utils";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  InputAccessoryView,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import { useChatRoom } from "../../contexts/chat-context";
import MessagesList from "./components.tsx/messages-list";
import { IGroup } from "../../interfaces/group-interface";
import { IUser } from "../../interfaces/post-interface";
import {
  fetchPushTokens,
  sendPushNotification,
} from "../../components/requests/notification-requsts";
import {
  fetchPushTokensUnmuted,
  openChatroom,
} from "../../components/requests/chats-requsts";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseconfig";

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
  const { mongoUser, getToken, setMongoUser } = useAuth();

  // load group metadata
  const [groupData, setGroupData] = React.useState<IGroup | null>(null);
  const [loadingGroup, setLoadingGroup] = React.useState(false);
  useEffect(() => {
    if (type === "group") {
      setLoadingGroup(true);
      fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/${groupParam!._id}`)
        .then((r) => r.json())
        .then(({ group }) => setGroupData(group))
        .catch(console.error)
        .finally(() => setLoadingGroup(false));
    }
  }, [type, groupParam]);

  // membership
  const isMember =
    type === "user" ||
    (!!groupData && groupData.members.some((m) => m.user === mongoUser!._id));

  // context hook
  const { messages, sendMessage, clearUnread } = useChatRoom({
    type,
    userId: type === "user" ? userParam?.firebase_id : undefined,
    groupId: type === "group" ? groupParam?._id : undefined,
  });

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
      console.log(expoTokens);
      // 2) skip if muted or no tokens
      if (expoTokens.length > 0) {
        await sendPushNotification(
          expoTokens,
          `${mongoUser!.username} sent you a message`,
          txt,
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
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // input bar
  const renderInput = () => {
    const bar = (
      <View className="px-3 py-2 bg-white border-t border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1">
          <TextInput
            ref={inputRef}
            className="flex-1 text-gray-700"
            placeholder="Type a message..."
            onChangeText={(v) => (textRef.current = v)}
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryID : undefined
            }
          />
          <TouchableOpacity onPress={handleSend}>
            <Text className="text-blue-500 font-semibold">Send</Text>
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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row items-center p-3 bg-white border-b border-gray-200">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-300" />
        )}
        <Text className="ml-3 text-lg font-semibold">{title}</Text>
      </View>

      {type === "group" && !loadingGroup && !isMember ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-500 text-center">
            Join the group to view messages.
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
      {type === "group" && !isMember ? null : renderInput()}
    </SafeAreaView>
  );
}
