import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import CreatePostButton from "../posts/components/create-post-buton";
import SearchInput from "../../components/search-input";
import PostCard from "../posts/components/post-card-on-feeds";
import { useFocusEffect } from "@react-navigation/native";
import { IPost } from "../../interfaces/post-interface";

const Home = ({ navigation }: any) => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch posts.
  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/all?privacy=public`
      );
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
    }, [])
  );

  // Handler for pull-to-refresh.
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Text className="text-xl font-bold">Home</Text>
      </View>

      {/* Search Input */}
      <TouchableOpacity
        onPress={() => navigation.navigate("SearchPage")}
        activeOpacity={0.8}
        className="mx-4 mt-2"
      >
        <View pointerEvents="none">
          <SearchInput placeholder="Search Everything..." editable={false} />
        </View>
      </TouchableOpacity>

      {/* Filters */}
      <View className="flex-row justify-around py-2 border-b border-gray-300 mt-4">
        <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
          <Text className="text-sm font-medium">Friends Only</Text>
        </TouchableOpacity>
        <TouchableOpacity className="px-4 py-2 bg-gray-100 rounded-lg">
          <Text className="text-sm font-medium">All</Text>
        </TouchableOpacity>
      </View>

      {/* Create Post */}
      <CreatePostButton
        navigation={navigation}
        location="home"
        onPress={() => console.log("create post clicked")}
      />

      {/* Posts Feed */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginTop: 20 }}
        />
      ) : (
        <ScrollView
          className="flex-1 m-2"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              navigation={navigation}
              onPostUpdated={(deletedPost) => {
                setPosts((prevPosts) =>
                  prevPosts.filter((p) => p._id !== deletedPost._id)
                );
              }}
              onPostLiked={(updatedPost: IPost) => {
                setPosts((prevPosts) =>
                  prevPosts.map((p) =>
                    p._id === updatedPost._id ? updatedPost : p
                  )
                );
              }}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default styled(Home);
