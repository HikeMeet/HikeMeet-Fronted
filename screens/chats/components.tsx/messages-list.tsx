import React, { useRef } from "react";
import { FlatList, View, Text } from "react-native";
import { IMessage } from "../../../interfaces/chat-interface";
import { MongoUser } from "../../../interfaces/user-interface";
import MessageItem from "./messge-item";

interface MessagesListProps {
  messages: IMessage[];
  currntUser: MongoUser;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currntUser,
}) => {
  const flatListRef = useRef<FlatList<IMessage>>(null);

  return (
    <FlatList
      ref={flatListRef}
      className="flex-1"
      data={messages}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={{ padding: 10 }}
      onContentSizeChange={(_w, h) =>
        flatListRef.current?.scrollToOffset({
          offset: h + 100, // <-- 100px extra “overscroll”
          animated: true,
        })
      }
      renderItem={({ item }) => (
        <MessageItem message={item} currentUser={currntUser}></MessageItem>
      )}
      ListEmptyComponent={() => (
        <View className="flex-1 justify-center items-center mt-12">
          <Text style={{ color: "#999" }}>Say hello</Text>
        </View>
      )}
    />
  );
};

export default MessagesList;
