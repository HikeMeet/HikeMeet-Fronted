// src/screens/NotificationsPage.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";

import { NotificationModel } from "../../interfaces/notification-interface";
import { fetchNotifications } from "../../components/requests/notification-requsts";
import { NotificationRow } from "./components/notification-row";

interface NotificationsPageProps {
  navigation: any;
}

export default function NotificationsPage({
  navigation,
}: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(5);

  const { getToken } = useAuth();

  const loadNotifications = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const notifs = await fetchNotifications(token);
      setNotifications(notifs);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setItemsToShow(5);
    loadNotifications();
  }, []);

  const handleLoadMore = () => {
    if (itemsToShow < notifications.length) {
      setItemsToShow((prev) => prev + 5);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={notifications.slice(0, itemsToShow)}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <NotificationRow item={item} navigation={navigation} />
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={() => (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">No notifications</Text>
        </View>
      )}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
}
