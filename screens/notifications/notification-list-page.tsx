// src/screens/NotificationsPage.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Constants from "expo-constants";

import { styled } from "nativewind";
import { useAuth } from "../../contexts/auth-context";
import { NotificationRow } from "./components/notification-row";
import { NotificationModel } from "../../interfaces/notification-interface";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(5);
  const { getToken } = useAuth();

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.warn("No Firebase user logged in—cannot fetch notifications");
        return;
      }
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/notification/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const json = await response.json();
      setNotifications(json.notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setItemsToShow(5);
    fetchNotifications();
  }, []);

  const handleLoadMore = () => {
    if (itemsToShow < notifications.length) {
      setItemsToShow((prev) => prev + 5);
    }
  };

  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </StyledView>
    );
  }

  return (
    <FlatList
      data={notifications.slice(0, itemsToShow)}
      keyExtractor={(item: NotificationModel) => item._id}
      renderItem={({ item }) => <NotificationRow item={item} />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={() => (
        <StyledView className="flex-1 justify-center items-center">
          <StyledText className="text-gray-500">No notifications</StyledText>
        </StyledView>
      )}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
}
