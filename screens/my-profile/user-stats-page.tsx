import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styled } from "nativewind";
import { useAuth } from "../../contexts/auth-context";

const StatsPage = ({ navigation }: any) => {
  const { mongoUser } = useAuth();

  if (!mongoUser) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Loading stats...</Text>
      </SafeAreaView>
    );
  }

  // Prepare stats items
  const stats = [
    {
      label: "Trips Completed",
      value: mongoUser.trip_history.length,
      icon: "map",
    },
    {
      label: "Total Likes",
      value: mongoUser.social.total_likes,
      icon: "thumb-up",
    },
    {
      label: "Total Saves",
      value: mongoUser.social.total_saves,
      icon: "bookmark",
    },
    {
      label: "Total Shares",
      value: mongoUser.social.total_shares,
      icon: "share",
    },
    { label: "Friends", value: mongoUser.friends.length, icon: "people" },
    {
      label: "Unread Notifications",
      value: mongoUser.unreadNotifications,
      icon: "notifications",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Your Stats</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {stats.map((stat, idx) => (
          <View
            key={idx}
            className="flex-row items-center bg-gray-100 p-4 rounded-lg mb-4"
          >
            <Icon name={stat.icon} size={28} color="#4F46E5" />
            <View className="ml-4">
              <Text className="text-2xl font-semibold">{stat.value}</Text>
              <Text className="text-gray-500">{stat.label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default styled(StatsPage);
