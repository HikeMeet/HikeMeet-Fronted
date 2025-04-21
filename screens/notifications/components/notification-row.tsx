// src/components/NotificationRow.tsx

import React, { useState } from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { useAuth } from "../../../contexts/auth-context";
import { markNotificationAsRead } from "../../../components/requests/notification-requsts";
import { NotificationModel } from "../../../interfaces/notification-interface";

interface NotificationRowProps {
  item: NotificationModel;
  navigation: any;
}

// Utility to format “time ago”
function timeAgo(dateString: string): string {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diff = now - past;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const NotificationRow: React.FC<NotificationRowProps> = ({
  item,
  navigation,
}) => {
  const [isRead, setIsRead] = useState(item.read);
  const data = item.data ?? {};
  const actor = data.actor;
  const { getToken } = useAuth();

  const handleNotificationPress = async () => {
    const nav = data.navigation;
    if (nav?.name) {
      navigation.push(nav.name, nav.params ?? {});
    }
    if (!isRead) setIsRead(true);
    if (data.id) {
      try {
        const token = await getToken();
        if (token) await markNotificationAsRead(token, data.id);
      } catch (err) {
        console.error("Error marking notification read:", err);
      }
    }
  };

  const handleProfilePress = () => {
    if (!actor?.id) return;
    navigation.navigate("AccountStack", {
      screen: "UserProfile",
      params: { userId: actor.id },
    });
  };

  // compute relative time once
  const ago = timeAgo(item.created_on);
  return (
    <TouchableOpacity onPress={handleNotificationPress}>
      <View
        className={`flex-row items-start px-4 py-3 border-b border-gray-200 ${
          isRead ? "bg-gray-100" : "bg-blue-100"
        }`}
      >
        {/* Avatar */}
        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={
              actor?.profileImage
                ? { uri: actor.profileImage }
                : require("../../../assets/Logo2.png")
            }
            className="w-10 h-10 rounded-full mr-3"
          />
        </TouchableOpacity>

        <View className="flex-1">
          {/* Title */}
          <Text className="text-base font-bold text-blue-500">
            {item.title}
          </Text>

          {/* Body + bold username + inline “time ago” */}
          <Text className="mt-1 text-sm text-gray-700">
            {actor?.username && (
              <>
                <Text className="font-bold" onPress={handleProfilePress}>
                  {actor.username}{" "}
                </Text>
              </>
            )}
            <Text>{item.body}</Text>
            <Text className="text-xs text-gray-500"> {ago}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
