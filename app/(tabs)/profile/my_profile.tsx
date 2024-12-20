import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { fetchUserProfile, UserProfile } from "../../../api/profile";
import { getToken } from "../../../services/tokenService";
import NavigationBar from "../../../components/NavigationBar";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Token not found. Please login again.");
        }

        const userProfile = await fetchUserProfile();
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
      {/* פרטי פרופיל */}
      <View style={tw`p-4 bg-white shadow-md items-center`}>
        {/* תמונת פרופיל וכפתור עריכה */}
        <View style={tw`relative`}>
          <Image
            source={{ uri: profile?.profilePicture || "https://via.placeholder.com/100" }}
            style={tw`w-24 h-24 rounded-full`}
          />
          <TouchableOpacity style={tw`absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full`}>
            <Text style={tw`text-white text-xs`}>✎</Text>
          </TouchableOpacity>
        </View>

        {/* שם משתמש ודרגה */}
        <Text style={tw`text-2xl font-bold text-gray-800 mt-4`}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={tw`text-sm text-gray-600 italic`}>Rank: {profile?.rank || "Adventurer"}</Text>

        {/* כפתור קבוצה */}
        <TouchableOpacity style={tw`bg-blue-500 px-4 py-2 rounded-full mt-2`}>
          <Text style={tw`text-white text-sm`}>Hikers</Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View style={tw`p-4 bg-white mt-2 shadow-md`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>Bio</Text>
        <Text style={tw`text-gray-600`}>
          {profile?.bio || "This is a short bio about the user. Share your adventures!"}
        </Text>
      </View>

      {/* פוסטים */}
      <ScrollView style={tw`p-4`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-4`}>Posts</Text>
        {profile?.posts && profile.posts.length > 0 ? (
          profile.posts.map((post, index) => (
            <View key={index} style={tw`bg-white shadow-md rounded-lg p-4 mb-4`}>
              <Text style={tw`text-lg font-bold text-gray-800`}>{post.title}</Text>
              <Text style={tw`text-gray-600 mb-2`}>{post.content}</Text>
              <TouchableOpacity style={tw`bg-blue-500 px-4 py-1 rounded-full mt-2`}>
                <Text style={tw`text-white text-center`}>Edit Post</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={tw`text-gray-500 italic`}>No posts available.</Text>
        )}
      </ScrollView>

      {/* Navigation Bar */}
      <NavigationBar />
    </View>
  );
}
