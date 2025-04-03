import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import CreatePostButton from "../posts/components/create-post-buton";
import BioSection from "./components/profile-bio-section";
import HikerButton from "../../components/profile-hikers-button";
import HikersList from "../../components/hikers-list-in-profile";
import ProfileImage from "../../components/profile-image";
import { useAuth } from "../../contexts/auth-context";
import { useFocusEffect } from "@react-navigation/native";
import { IPost } from "../../interfaces/post-interface";
import PostCard from "../posts/components/post-card-on-feeds";

const ProfilePage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { mongoUser } = useAuth();
  const [showHikers, setShowHikers] = useState<boolean>(false);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);

  const toggleHikers = () => {
    setShowHikers((prev) => !prev);
  };

  // When screen is focused, hide the hikers list.
  useFocusEffect(
    useCallback(() => {
      setShowHikers(false);
    }, [])
  );

  // Fetch posts created by this user.
  const fetchPosts = async () => {
    if (!mongoUser) return;
    setLoadingPosts(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/all?userId=${mongoUser._id}`
      );
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [mongoUser]);

  if (!mongoUser) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text>Failed to load user data.</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProfilePage")}
          className="mt-4 bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render header content for the posts feed.
  const renderPostsHeader = () => (
    <View className="p-4">
      <BioSection bio={mongoUser.bio} />
      <View className="h-px bg-gray-300 my-4" />
      <CreatePostButton
        navigation={navigation}
        location="home"
        onPress={() => console.log("create post clicked")}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Profile Header */}
      <View className="flex-row items-center p-4">
        <ProfileImage
          initialImageUrl={mongoUser.profile_picture.url}
          size={80}
          id={mongoUser._id}
          uploadType="profile"
        />
        <View className="flex-1 ml-5">
          <Text className="text-lg font-bold">{mongoUser.username}</Text>
          <Text className="text-lg font-bold">{`${mongoUser.first_name} ${mongoUser.last_name}`}</Text>
          <Text className="text-sm text-gray-500">Rank: Adventurer</Text>
          <HikerButton
            showHikers={showHikers}
            toggleHikers={toggleHikers}
            user={mongoUser}
          />
        </View>
      </View>

      {showHikers ? (
        <HikersList
          isMyProfile={true}
          navigation={navigation}
          profileId={mongoUser._id}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            // Replace with your actual PostCard component that displays a post.
            <PostCard post={item} navigation={navigation} />
          )}
          ListHeaderComponent={renderPostsHeader}
          refreshing={loadingPosts}
          onRefresh={fetchPosts}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default styled(ProfilePage);
