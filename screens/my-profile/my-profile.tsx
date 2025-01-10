import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { MongoUser } from "../../interfaces/user-interface";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";
import BioSection from "../../components/profile-bio-section";
import BackButton from "../../components/back-button";
import CreatePostButton from "../../components/create-post-buton";

const ProfilePage = ({ navigation }: any) => {
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
          Alert.alert("Error", "Failed to fetch user data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();

      return () => {
        console.log("Cleaning up on screen blur");
      };
    }, [mongoId])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Failed to load user data.</Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            navigation.navigate("ProfilePage"); // Reload
          }}
          className="mt-4 bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Text className="text-xl font-bold"></Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2099/2099058.png",
            }}
            className="w-6 h-6"
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
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
            <Text className="text-sm text-gray-500 mb-2">
              Rank: {"Adventurer"}
            </Text>
          </View>
        </View>

        {/* Bio Section */}
        <BioSection bio={user.bio} mongoId={mongoId} />
        <View className="h-px bg-gray-300 my-4" />

        <CreatePostButton
          location="home"
          onPress={() => console.log("create post clicked")}
        />
        <ScrollView className="flex-1 px-4">
          {[1, 2, 3].map((post, index) => (
            <View
              key={index}
              className="mb-4 p-4 bg-gray-100 rounded-lg flex-row justify-between items-center"
            >
              <Text className="text-sm">Post</Text>
              <Ionicons name="create-outline" size={20} color="gray" />
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfilePage;
