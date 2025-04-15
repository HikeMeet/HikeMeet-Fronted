import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Notifications from "expo-notifications";

const ChatListPage = () => {
  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 התראה",
        body: "זו התראה שבאה לאחר 3 שניות",
        sound: "default",
      },
      trigger: {
        seconds: 7,
      } as Notifications.TimeIntervalNotificationTrigger,
    });
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <TouchableOpacity
        onPress={scheduleNotification}
        className="bg-emerald-600 px-6 py-3 rounded-xl shadow-md"
      >
        <Text className="text-white font-bold text-lg">שלsssח התראה</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatListPage;
