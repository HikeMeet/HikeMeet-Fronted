import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { MongoUser } from "../../interfaces/user-interface";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";

const ProfilePage = ({ navigation }: any) => {
  const [user, setUser] = useState<MongoUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [bio, setBio] = useState<string | undefined>("");
  const { mongoId } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const response = await fetch(
            `http://172.20.10.4:5000/api/user/${mongoId}`
          );
          if (!response.ok) {
            throw new Error(`Error fetching user data: ${response.status}`);
          }
          const data = await response.json();
          setUser(data);
          setBio(data.bio); // Set initial bio
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

  const handleSaveBio = async () => {
    if (!user) return;
    setSaving(true);
    try {
      console.log(mongoId);
      const response = await fetch(
        `http://172.20.10.4:5000/api/user/${mongoId}/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bio: bio }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update bio.");
      }
      Alert.alert("Success", "Bio updated successfully.");
    } catch (error) {
      console.error("Error updating bio:", error);
      Alert.alert("Error", "Failed to update bio. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
        <Text className="text-xl font-bold">Profile</Text>
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

        {/* Bio */}
        <View className="mt-4">
          <Text className="text-sm font-bold mb-2">Bio</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded min-h-[60px]"
            placeholder="Write your bio here..."
            multiline
            value={bio}
            onChangeText={setBio}
          />
          <TouchableOpacity
            onPress={handleSaveBio}
            className={`mt-4 bg-blue-500 px-4 py-2 rounded ${
              saving ? "opacity-50" : ""
            }`}
            disabled={saving}
          >
            <Text className="text-white text-center">
              {saving ? "Saving..." : "Save Bio"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfilePage;
