// src/components/NotificationRow.tsx

import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../contexts/auth-context";
import { markNotificationAsRead } from "../../../components/requests/notification-requsts";
import { NotificationModel } from "../../../interfaces/notification-interface";
import { timeAgo } from "./time-ago";

interface NotificationRowProps {
  item: NotificationModel;
  navigation: any;
}

export const NotificationRow: React.FC<NotificationRowProps> = ({
  item,
  navigation,
}) => {
  const [isRead, setIsRead] = useState(item.read);
  const data = item.data ?? {};
  const actor = data.actor;
  const group = data.group;
  const { getToken } = useAuth();
  const ago = timeAgo(item.created_on);

  useEffect(() => {
    setIsRead(item.read);
  }, [item.read]);

  // decide which icon to show in the title
  let iconName: React.ComponentProps<typeof Ionicons>["name"] =
    "notifications-outline";
  if (item.type.startsWith("group_")) iconName = "people-outline";
  else if (item.type.startsWith("post_"))
    iconName = "chatbubble-ellipses-outline";
  else if (item.type.startsWith("friend_") || item.type.startsWith("user_"))
    iconName = "person-add-outline";

  // avatar: actor first, then group, else placeholder
  const avatarSource = actor?.profileImage
    ? { uri: actor.profileImage }
    : group?.imageUrl
      ? { uri: group.imageUrl }
      : require("../../../assets/Logo2.png");

  const handleNotificationPress = async () => {
    const type = item.type;

    if (type.startsWith("group_") && group?.id) {
      navigation.push("GroupsStack", {
        screen: "GroupPage",
        params: { groupId: group.id },
      });
    } else if (type.startsWith("post_") && data.navigation?.params?.postId) {
      navigation.push("PostStack", {
        screen: "PostPage",
        params: { postId: data.navigation.params.postId },
      });
    } else if (
      (type.startsWith("friend_") || type.startsWith("user_")) &&
      actor?.id
    ) {
      navigation.push("AccountStack", {
        screen: "UserProfile",
        params: { userId: actor.id },
      });
    } else if (data.navigation?.name) {
      navigation.push(data.navigation.name, data.navigation.params ?? {});
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
    if (actor?.id) {
      navigation.navigate("AccountStack", {
        screen: "UserProfile",
        params: { userId: actor.id },
      });
    } else if (group?.id) {
      navigation.navigate("GroupsStack", {
        screen: "GroupPage",
        params: { groupId: group.id },
      });
    }
  };

  return (
    <TouchableOpacity onPress={handleNotificationPress} activeOpacity={0.8}>
      <View
        className={`
          bg-${isRead ? "blue-50" : "white"} 
          rounded-lg 
          mx-4 mb-1
          p-4 
          border border-gray-200
          ${Platform.OS === "ios" ? "shadow-lg" : "elevation-2"}
        `}
      >
        {/* Title with icon */}
        <View className="flex-row items-center mb-2">
          <Ionicons name={iconName} size={18} color="#3B82F6" />
          <Text className="ml-2 text-base font-bold text-blue-500">
            {item.title}
          </Text>
        </View>

        {/* Content */}
        <View className="flex-row">
          {/* Avatar */}
          <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={avatarSource}
              className="w-10 h-10 rounded-full mr-3"
            />
          </TouchableOpacity>

          {/* Message */}
          <View className="flex-1">
            <Text className="text-sm text-gray-700 mb-1">
              {actor?.username ? (
                <Text
                  className="font-bold text-blue-500"
                  onPress={handleProfilePress}
                >
                  {actor.username}{" "}
                </Text>
              ) : group?.name ? (
                <Text
                  className="font-bold text-blue-500"
                  onPress={handleProfilePress}
                >
                  {group.name}{" "}
                </Text>
              ) : null}
              <Text>{item.body}</Text>
            </Text>
            <Text className="text-xs text-gray-500">{ago}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
