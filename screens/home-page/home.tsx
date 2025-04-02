import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import CreatePostButton from "../../components/create-post-buton";
import SearchInput from "../../components/search-input";
import PostCard from "../posts/components/post-card-on-feeds";

const Home = ({ navigation }: any) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/post/all`
        );
        const data = await response.json();
        // Assuming the route returns { posts: [...] }
        setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
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
      <ScrollView className="flex-1 px-4">
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPress={() =>
                navigation.navigate("PostStack", {
                  screen: "PostPage",
                  params: { postId: post._id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default styled(Home);
