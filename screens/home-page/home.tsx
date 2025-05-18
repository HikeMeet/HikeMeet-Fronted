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
import { useAuth } from "../../contexts/auth-context";

const Home = ({ navigation }: any) => {
  const { user, mongoId, mongoUser, fetchMongoUser } = useAuth();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Toggle state: true for Friends Only, false for All.
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [postsToShow, setPostsToShow] = useState<number>(5);
  const unread = mongoUser?.unreadNotifications ?? 0;

  // Function to fetch posts.
  const fetchPosts = async () => {
    try {
      let url = `${process.env.EXPO_LOCAL_SERVER}/api/post/all?privacy=public`;
      if (showFriendsOnly) {
        url = `${process.env.EXPO_LOCAL_SERVER}/api/post/all?friendsOnly=true`;
      }

      const headers: HeadersInit | undefined = mongoId
        ? { "x-current-user": mongoId }
        : undefined;

      const response = await fetch(url, { headers });
      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // When the screen is focused, refetch the posts.
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      console.log("::::", mongoId);
      // if (mongoId) fetchMongoUser(user!.uid, true);
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
    console.log(mongoId);
    fetchMongoUser(mongoId!);
  }, [showFriendsOnly]);

  // Render the header for the FlatList.
  // Here we combine all header sections into one component so they scroll together.
  const renderHeader = () => (
    <View className="bg-white">
      {/* Header Section */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Text className="text-xl font-bold">Hikemeet</Text>
        <View className="flex-row items-center space-x-4">
          {/* Search button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("SearchPage")}
            className="flex flex-row items-center"
          >
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
          {/* notifications button with badge */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("NotificationsPage");
              fetchMongoUser(mongoId!);
            }}
            className="relative"
          >
            <Ionicons name="notifications-outline" size={24} color="black" />
            {unread > 0 && (
              <View
                className="
                absolute 
                -top-1 
                -right-1 
                bg-red-500 
                rounded-full 
                w-5 
                h-5 
                items-center 
                justify-center
              "
              >
                <Text className="text-white text-xs font-bold">
                  {unread > 9 ? "9+" : unread}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
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
    </View>
  );
};

export default styled(Home);
