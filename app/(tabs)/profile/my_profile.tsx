import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import tw from "tailwind-react-native-classnames";
import { fetchUserProfile, UserProfile } from "../../../api/profile";
import { getToken } from "../../../services/tokenService"; // שימוש בשירות לניהול טוקן
import NavigationBar from "../../../components/NavigationBar";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await getToken(); // שליפת הטוקן מהשירות
        if (!token) {
          throw new Error("Token not found. Please login again.");
        }

        const userProfile = await fetchUserProfile(); // קריאה לשרת עם הטוקן
        setProfile(userProfile);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
        <Text style={tw`text-lg text-red-500`}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      <View style={tw`p-4 bg-white shadow-md items-center`}>
        <Image
          source={{ uri: profile?.profilePicture || "https://via.placeholder.com/100" }}
          style={tw`w-24 h-24 rounded-full`}
        />
        <Text style={tw`text-2xl font-bold text-gray-800 mt-4`}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={tw`text-lg text-gray-600`}>{profile?.email}</Text>
      </View>
      <View style={tw`p-4`}>
        <TouchableOpacity style={tw`bg-blue-500 py-3 rounded-lg shadow-md`}>
          <Text style={tw`text-white text-center`}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <NavigationBar />
    </View>
  );
}
