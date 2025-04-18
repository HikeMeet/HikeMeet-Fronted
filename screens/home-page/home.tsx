import { useState, useCallback } from "react";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import CreatePostButton from "../posts/components/create-post-buton";
import PostCard from "../posts/components/post-card-on-feeds";
import { useFocusEffect } from "@react-navigation/native";
import { IPost } from "../../interfaces/post-interface";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth-context";

const Home = ({ navigation }: any) => {
  const { mongoId } = useAuth();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Toggle state: true for Friends Only, false for All.
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [postsToShow, setPostsToShow] = useState<number>(5);

  // Function to fetch posts.
  const fetchPosts = async () => {
    try {
      // Base URL always includes privacy=public.
      let url = `${process.env.EXPO_LOCAL_SERVER}/api/post/all?privacy=public`;
      // If Friends Only is selected, append query parameters.
      if (showFriendsOnly) {
        url = `${process.env.EXPO_LOCAL_SERVER}/api/post/all?friendsOnly=true&userId=${mongoId}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // When the screen is focused, refetch the posts.
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPosts();
    }, [showFriendsOnly]) // Re-fetch posts when filter changes.
  );

  const handleLoadMorePosts = useCallback(() => {
    if (postsToShow < posts.length) {
      setPostsToShow((prev) => prev + 5);
    }
  }, [postsToShow, posts.length]);

  // Handler for pull-to-refresh.
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [showFriendsOnly]);

  // Render the header for the FlatList.
  // Here we combine all header sections into one component so they scroll together.
  const renderHeader = () => (
    <View className="bg-white">
      {/* Header Section */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Text className="text-xl font-bold">Hikemeet</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SearchPage")}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {/* Filters Toggle */}
      <View className="flex-row justify-around py-2 border-b border-gray-300 bg-white">
        <TouchableOpacity
          onPress={() => setShowFriendsOnly(true)}
          className={`px-4 py-2 rounded-lg ${showFriendsOnly ? "bg-blue-500" : "bg-gray-100"}`}
        >
          <Text
            className={`text-sm font-medium ${showFriendsOnly ? "text-white" : "text-gray-700"}`}
          >
            Friends Only
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowFriendsOnly(false)}
          className={`px-4 py-2 rounded-lg ${!showFriendsOnly ? "bg-blue-500" : "bg-gray-100"}`}
        >
          <Text
            className={`text-sm font-medium ${!showFriendsOnly ? "text-white" : "text-gray-700"}`}
          >
            All
          </Text>
        </TouchableOpacity>
      </View>
      {/* Create Post Button */}
      <View className="bg-white py-2">
        <CreatePostButton
          navigation={navigation}
          location="home"
          onPress={() => console.log("create post clicked")}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          // When loading, pass an empty array so the list shows only the header and the empty view.
          data={!loading ? posts.slice(0, postsToShow) : []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={{ padding: 8 }}>
              <PostCard
                post={item}
                navigation={navigation}
                onPostUpdated={(deletedPost) => {
                  setPosts((prevPosts) =>
                    prevPosts.filter((p) => p._id !== deletedPost._id)
                  );
                }}
                onPostLiked={(updatedPost) => {
                  setPosts((prevPosts) =>
                    prevPosts.map((p) =>
                      p._id === updatedPost._id ? updatedPost : p
                    )
                  );
                }}
              />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          // When there are no posts (e.g., loading is true), show a loading indicator only in the list area.
          ListEmptyComponent={
            loading ? (
              <View
                style={{
                  height: 200,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : null
          }
          onEndReached={handleLoadMorePosts}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default styled(Home);
