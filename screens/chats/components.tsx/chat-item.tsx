import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { IUser } from "../../../interfaces/post-interface";
import { useAuth } from "../../../contexts/auth-context";
import { formatDate, getRoomId } from "../../../utils/chat-utils";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../../firebaseconfig";
import { IMessage } from "../../../interfaces/chat-interface";

interface ChatItemProps {
  user: IUser;
  navigation: any;
  onPress?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ user, onPress, navigation }) => {
  const { mongoId, mongoUser } = useAuth();
  const [lastMessageText, setLastMessageText] = useState<
    IMessage | null | undefined
  >(undefined);

  useEffect(() => {
    let roomId = getRoomId(mongoUser!.firebase_id, user.firebase_id!);
    const docRef = doc(FIREBASE_DB, "rooms", roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    let unsub = onSnapshot(q, (snapshot) => {
      let allMessages: IMessage[] = snapshot.docs.map((doc) => {
        return doc.data() as IMessage;
      });
      setLastMessageText(allMessages[0] ? allMessages[0] : null);
    });
    return unsub;
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
  const renderTime = () => {
    if (lastMessageText) {
      let date = lastMessageText.createdAt;
      return formatDate(new Date(date.seconds * 1000));
    }
  };
  const renderLastMessage = () => {
    if (lastMessageText === undefined) {
      return "Loading...";
    }
    if (lastMessageText) {
      if (mongoUser?.firebase_id === lastMessageText.userId) {
        return "You: " + lastMessageText.text;
      } else {
        return lastMessageText.text;
      }
    } else {
      return "Say Hi 👋";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 bg-white border-b border-gray-200"
    >
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

      <View className="ml-4 flex-1">
        <View className="flex-row justify-between">
          <Text className="text-base font-semibold text-gray-800">
            {user.username}
          </Text>
          <Text className="text-sm font-semibold text-gray-600">
            {renderTime()}
          </Text>
        </View>

        <Text className="text-sm text-gray-600 mt-1">
          {renderLastMessage()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem;
