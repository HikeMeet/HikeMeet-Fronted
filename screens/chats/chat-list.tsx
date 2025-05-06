import React from "react";
import { View, Text, FlatList } from "react-native";

import { useAuth } from "../../contexts/auth-context";
import ChatItem from "./components.tsx/chat-item";
import { IUser } from "../../interfaces/post-interface";

const ChatListPage: React.FC<any> = ({ navigation }) => {
  const { users, mongoId } = useAuth(); // assume auth context provides an array of IUser

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={users.filter((user) => user._id !== mongoId)}
        keyExtractor={(item: IUser) => item._id}
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
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">No chats yet</Text>
          </View>
        }
      />
    </View>
  );
};

export default ChatListPage;
