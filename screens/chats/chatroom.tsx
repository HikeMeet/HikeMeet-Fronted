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
  ScrollView,
  Keyboard,
  InputAccessoryView,
} from "react-native";
import { IUser } from "../../interfaces/post-interface";
import { useAuth } from "../../contexts/auth-context";
import MessagesList from "./components.tsx/messages-list";
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
} from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseconfig";
import { IMessage } from "../../interfaces/chat-interface";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { openChatroom } from "../../components/requests/chats-requsts";

interface ChatRoomPageProps {
  route: {
    params: { user: IUser };
  };
  navigation: any;
}

const ChatRoomPage: React.FC<ChatRoomPageProps> = ({ route, navigation }) => {
  const { user } = route.params;
  const { mongoId, mongoUser, getToken } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const textRef = useRef("");
  const inputRef = useRef<TextInput | null>(null);
  const insets = useSafeAreaInsets();
  const inputAccessoryViewID = "uniqueID";

  const createRoomIfNotExists = async () => {
    let roomId = getRoomId(mongoUser!.firebase_id, user.firebase_id!);
    const roomSnapshot = await getDoc(doc(FIREBASE_DB, "rooms", roomId));

    if (!roomSnapshot.exists()) {
      await setDoc(doc(FIREBASE_DB, "rooms", roomId), {
        roomId,
        createdAt: Timestamp.fromDate(new Date()),
      });
      console.log("Room created:", roomId);
    } else {
      console.log("Room already exists:", roomId);
    }
    const token = await getToken();
    if (!token) return;
    await openChatroom(user._id!, token);
  };

  useEffect(() => {
    createRoomIfNotExists();
    let roomId = getRoomId(mongoUser!.firebase_id, user.firebase_id!);
    const docRef = doc(FIREBASE_DB, "rooms", roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    let unsub = onSnapshot(q, (snapshot) => {
      let allMessages: IMessage[] = snapshot.docs.map((doc) => {
        return doc.data() as IMessage;
      });
      setMessages([...allMessages]);
    });

    return () => {
      unsub();
    };
  }, []);

  const handleProfileImagePress = () => {
    if (user._id === mongoId) {
      navigation.push("Tabs", { screen: "Profile" });
    } else {
      navigation.push("AccountStack", {
        screen: "UserProfile",
        params: { userId: user._id },
      });
    }
  };

  const handleSendMessage = async () => {
    let message = textRef.current.trim();
    if (!message) return;
    try {
      let roomId = getRoomId(mongoUser!.firebase_id, user.firebase_id!);
      const docRef = doc(FIREBASE_DB, "rooms", roomId);
      const messagesRef = collection(docRef, "messages");
      textRef.current = "";
      if (inputRef) inputRef.current?.clear();
      const newDoc = await addDoc(messagesRef, {
        userId: mongoUser!.firebase_id,
        text: message,
        senderName: mongoUser!.username,
        createdAt: Timestamp.fromDate(new Date()),
      });
      console.log("Message sent:", newDoc.id);
    } catch (error: any) {
      Alert.alert("message", error);
    }
  };

  // Input component that works on both platforms
  const renderInputBar = () => {
    const inputBar = (
      <View
        className="px-4 py-2 bg-white border-t border-gray-200"
        style={{ paddingBottom: Platform.OS === "ios" ? 0 : insets.bottom }}
      >
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            ref={inputRef}
            className="flex-1 text-gray-800"
            placeholder="Type a message"
            onChangeText={(value) => (textRef.current = value)}
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
          />
          <TouchableOpacity className="ml-2" onPress={handleSendMessage}>
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleProfileImagePress}>
          {user.profile_picture.url ? (
            <Image
              source={{ uri: user.profile_picture.url }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-300" />
          )}
        </TouchableOpacity>
        <Text className="ml-2 text-base font-semibold text-gray-800">
          {user.username}
        </Text>
      </View>

      {/* Messages */}
      <View
        className="flex-1 bg-gray-100"
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          return false;
        }}
      >
        <MessagesList messages={messages} currntUser={mongoUser!} />
      </View>

      {/* Input bar */}
      {renderInputBar()}
    </SafeAreaView>
  );
};

export default ChatRoomPage;
