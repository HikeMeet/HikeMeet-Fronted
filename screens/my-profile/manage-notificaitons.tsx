// src/screens/ManageNotifications.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import debounce from "lodash.debounce";
import { useAuth } from "../../contexts/auth-context";

const ALL_NOTIFICATION_TYPES = [
  "post_like",
  "post_create_in_group",
  "post_shared",
  "post_shared_in_group",
  "post_comment",
  "comment_like",
  "friend_request",
  "friend_accept",
  "Rank_up",
  "group_updated",
  "group_invite",
  "group_invite_accepted",
  "group_joined",
  "group_join_request",
  "group_join_approved",
  "report_created",
] as const;

type NotificationType = (typeof ALL_NOTIFICATION_TYPES)[number];

export default function ManageNotifications() {
  const { mongoUser, mongoId, setMongoUser } = useAuth();
  const [mutedTypes, setMutedTypes] = useState<NotificationType[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize from context
  useEffect(() => {
    if (mongoUser?.mutedNotificationTypes) {
      setMutedTypes(mongoUser.mutedNotificationTypes as NotificationType[]);
    }
  }, [mongoUser]);

  // Debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce(async (newMuted: NotificationType[]) => {
        setSaving(true);
        try {
          const res = await fetch(
            `${process.env.EXPO_LOCAL_SERVER}/api/user/${mongoId}/update`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                mutedNotificationTypes: newMuted,
              }),
            }
          );
          if (!res.ok) {
            const txt = await res.json();
            throw new Error(txt || "Failed to save settings");
          }
          const mongoUpdatedUser = await res.json();
          // refresh user in context
          await setMongoUser(mongoUpdatedUser);
        } catch (err: any) {
          console.error("Error saving muted types:", err);
          Alert.alert("Error", err.message || "Could not save settings");
        } finally {
          setSaving(false);
        }
      }, 700),
    [mongoUser, setMongoUser]
  );

  // Called on each toggle
  const onToggle = (type: NotificationType) => {
    const next = mutedTypes.includes(type)
      ? mutedTypes.filter((t) => t !== type)
      : [...mutedTypes, type];
    setMutedTypes(next);
    debouncedSave(next);
  };

  if (!mongoUser) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading user…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {saving && (
        <ActivityIndicator size="small" color="#3B82F6" className="mt-2" />
      )}

      <View className="flex-row justify-between items-center px-4 py-2 bg-gray-200 border-b border-gray-200">
        <Text className="text-base font-medium">Mute All</Text>
        <Switch
          value={mutedTypes.length === ALL_NOTIFICATION_TYPES.length}
          onValueChange={(on) => {
            const newMuted = on ? [...ALL_NOTIFICATION_TYPES] : [];
            setMutedTypes(newMuted);
            debouncedSave(newMuted);
          }}
          thumbColor={
            mutedTypes.length === ALL_NOTIFICATION_TYPES.length
              ? "#EF4444"
              : "#fff"
          }
          trackColor={{ true: "#FCA5A5", false: "#D1D5DB" }}
        />
      </View>

      <ScrollView className="px-4">
        {ALL_NOTIFICATION_TYPES.map((type) => {
          // cast to string so .replace is available
          const label = (type as string)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          const isMuted = mutedTypes.includes(type);
          return (
            <View
              key={type}
              className="flex-row justify-between items-center py-3 border-b border-gray-100"
            >
              <Text className="text-base text-gray-800">{label}</Text>
              <Switch
                value={isMuted}
                onValueChange={() => onToggle(type)}
                thumbColor={isMuted ? "#EF4444" : "#fff"}
                trackColor={{ true: "#FCA5A5", false: "#D1D5DB" }}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
