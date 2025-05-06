import React from "react";
import { View, Text, FlatList } from "react-native";

import { useAuth } from "../../contexts/auth-context";
import ChatItem from "./components.tsx/chat-item";
import { IUser } from "../../interfaces/post-interface";

const ChatListPage: React.FC<any> = ({ navigation }) => {
  const { mongoUser } = useAuth(); // assume auth context provides an array of IUser

  return (
    <View className="flex-1 bg-white">
      <View className="py-4 px-6 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-800">Chat Rooms</Text>
      </View>
      <FlatList
        data={mongoUser?.chatrooms_with || []}
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
