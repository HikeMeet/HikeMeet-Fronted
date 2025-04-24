// src/components/NotificationRow.tsx

import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../contexts/auth-context";
import { markNotificationAsRead } from "../../../components/requests/notification-requsts";
import {
  IfromUser,
  NotificationModel,
} from "../../../interfaces/notification-interface";
import { timeAgo } from "./time-ago";
import { getNotificationIconName } from "./notification-icon-const";
import FriendActionButton from "../../../components/friend-button";

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
  const actor = item.from as IfromUser;
  const group = data.groupId;
  const { getToken, fetchMongoUser, mongoId, mongoUser } = useAuth();
  const ago = timeAgo(item.created_on);

  useEffect(() => {
    setIsRead(item.read);
  }, [item.read]);

  let iconName = getNotificationIconName(item.type);

  // avatar: actor first, then group, else placeholder
  const avatarType =
    item.data!.imageType === "group"
      ? "group"
      : item.data!.imageType === "user"
        ? "profile"
        : "logo";
  const avatarSource =
    item.data!.imageType === "group" && group
      ? { uri: group.main_image.url }
      : item.data!.imageType === "user" && actor
        ? { uri: actor.profile_picture.url }
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
      actor?._id
    ) {
      navigation.push("AccountStack", {
        screen: "UserProfile",
        params: { userId: actor._id },
      });
    } else if (data.navigation?.name) {
      navigation.push(data.navigation.name, data.navigation.params ?? {});
    }

    console.log("Notification ID:", item._id);
    try {
      const token = await getToken();
      if (token) {
        await markNotificationAsRead(token, item._id);
        fetchMongoUser(mongoId!);
      }
    } catch (err) {
      console.error("Error marking notification read:", err);
    }

    if (!isRead) setIsRead(true);
  };

  const handleProfilePress = (type: string) => {
    if (type === "profile" && actor?._id) {
      navigation.navigate("AccountStack", {
        screen: "UserProfile",
        params: { userId: actor._id },
      });
    } else if (type === "group" && group?._id) {
      navigation.navigate("GroupsStack", {
        screen: "GroupPage",
        params: { groupId: group.id },
      });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    // e.g. remove this notification row or mark read
    setIsRead(true);
    if (data.id) {
      // mark read on backend if you like
    }
  };

  const handleNotificationLongPress = () => {};
  return (
    <TouchableOpacity
      onPress={handleNotificationPress}
      activeOpacity={0.8}
      onLongPress={handleNotificationLongPress}
    >
      <View
        className={`
          bg-${isRead ? "white" : "blue-200"} 
          rounded-lg 
          mx-4 mb-1
          p-4 
          border border-gray-200
          ${Platform.OS === "ios" ? "shadow-lg" : "elevation-2"}
        `}
      >
        {/* Title with icon */}
        <View className="flex-row items-center mb-2">
          <Ionicons name={iconName as any} size={18} color="#3B82F6" />
          <Text className="ml-2 text-base font-bold text-blue-500">
            {item.title}
          </Text>
        </View>

        {/* Content */}
        <View className="flex-row">
          {/* Avatar */}
          <TouchableOpacity onPress={() => handleProfilePress(avatarType)}>
            <Image
              source={avatarSource}
              className="w-10 h-10 rounded-full mr-3"
            />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="mt-1 text-sm text-gray-700">
              {/* actor name, if any */}
              {actor?.username && group?.name ? (
                <>
                  <Text
                    className="font-bold text-purple-500"
                    onPress={() => handleProfilePress("profile")}
                  >
                    {actor.username}{" "}
                  </Text>
                  <Text>{item.body}</Text>
                  <Text
                    className="font-bold text-purple-500"
                    onPress={() => handleProfilePress("group")}
                  >
                    {group.name}
                  </Text>
                </>
              ) : actor?.username ? (
                <>
                  <Text
                    className="font-bold text-purple-500"
                    onPress={() => handleProfilePress("profile")}
                  >
                    {actor.username}{" "}
                  </Text>
                  <Text>{item.body}</Text>
                </>
              ) : group?.name ? (
                <>
                  <Text
                    className="font-bold text-purple-500"
                    onPress={() => handleProfilePress("group")}
                  >
                    {group.name}{" "}
                  </Text>
                  <Text>{item.body}</Text>
                </>
              ) : null}
            </Text>
            <Text className="text-xs text-gray-500">{ago}</Text>
          </View>
          {/* ---- HERE: FriendActionButton for new requests ---- */}
          {item.type === "friend_request" && actor?._id && (
            <FriendActionButton
              targetUserId={actor._id}
              status={
                mongoUser?.friends?.find((friend) => friend.id === actor._id)
                  ?.status || "none"
              }
              onStatusChange={handleStatusChange}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
