// src/screens/NotificationsPage.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/auth-context";

import { NotificationModel } from "../../interfaces/notification-interface";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "../../components/requests/notification-requsts";
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
  const [itemsToShow, setItemsToShow] = useState(10);

  const { getToken, fetchMongoUser, mongoId } = useAuth();

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
    setItemsToShow(10);
    loadNotifications();
  }, []);

  const handleLoadMore = () => {
    if (itemsToShow < notifications.length) {
      setItemsToShow((prev) => prev + 5);
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic UI
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const token = await getToken();
      if (token) {
        await markAllNotificationsAsRead(token);
        fetchMongoUser(mongoId!);
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleClearAll = async () => {
    // Optimistic UI
    setNotifications([]);
    try {
      const token = await getToken();
      if (token) await clearAllNotifications(token);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      loadNotifications();
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
    <View className="flex-1 bg-gray-50">
      {/* Sticky Header */}
      <View
        className={`flex-row justify-between items-center bg-white px-4 py-3 ${
          Platform.OS === "ios" ? "shadow-lg" : "elevation-2"
        }`}
      >
        <Text className="text-lg font-semibold">Notifications</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleMarkAllRead}
            className="flex-row items-center bg-green-500 px-3 py-1 rounded-full"
          >
            <Ionicons name="checkmark-done-outline" size={16} color="white" />
            <Text className="text-white ml-1 text-sm">Mark all read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearAll}
            className="flex-row items-center bg-red-500 px-3 py-1 rounded-full"
          >
            <Ionicons name="trash-outline" size={16} color="white" />
            <Text className="text-white ml-1 text-sm">Clear all</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification list */}
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
    </View>
  );
}
