import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatRoomPage from "../../screens/chats/chatroom";

// Import your trip-related screens

const Stack = createNativeStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator initialRouteName="ChatRoomPage">
      <Stack.Screen
        name="ChatRoomPage"
        component={ChatRoomPage as React.ComponentType<any>}
        options={{ title: "chatroom", headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ChatStack;
