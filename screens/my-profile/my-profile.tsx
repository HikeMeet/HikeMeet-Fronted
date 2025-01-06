import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MongoUser } from "../../interfaces/user-interface";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";

const ProfilePage = () => {
  const [user, setUser] = useState<MongoUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { mongoId } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const response = await fetch(
            `${process.env.EXPO_LOCAL_SERVER}/api/user/${mongoId}`
          );
          if (!response.ok) {
            throw new Error(`Error fetching user data: ${response.status}`);
          }
          const data = await response.json();
          setUser(data);
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();

      return () => {
        // Optional: Cleanup logic when leaving the page
        console.log("Cleaning up on screen blur");
      };
    }, [mongoId])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Failed to load user data.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center p-5 bg-gray-100"></View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 p-4">
        {/* Profile Info */}
        <View className="flex-row items-center mb-4">
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
            }}
            className="w-20 h-20 rounded-full mr-4"
          />
          <View className="flex-1">
            <Text className="text-lg font-bold">{user.username}</Text>
            <Text className="text-lg font-bold mb-1">{`${user.first_name} ${user.last_name}`}</Text>
            <Text className="text-sm text-gray-500 mb-2">Rank: Adventurer</Text>
            <TouchableOpacity className="bg-gray-200 px-4 py-2 rounded mb-2 flex-row items-center">
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
                }}
                className="w-4 h-4 mr-2"
              />
              <Text>Hikers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio */}
        <View className="mt-4">
          <Text className="text-sm font-bold mb-2">Bio</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded min-h-[60px]"
            placeholder="Write your bio here..."
            editable={false}
            multiline
            value={user.bio}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
