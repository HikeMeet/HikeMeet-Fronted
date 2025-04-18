import { useEffect, useState, useCallback } from "react";
import React from "react";
import {
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from "react-native";
import PostCard from "../posts/components/post-card-on-feeds";
import { useAuth } from "../../contexts/auth-context";
import { IPost } from "../../interfaces/post-interface";
import { fetchLikedSavedPostsForUser } from "../../components/requests/fetch-posts";

interface SavedPostsProps {
  route: any;
  navigation: any;
}

const SavedPosts: React.FC<SavedPostsProps> = ({ route, navigation }) => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { mongoId } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      const fetchedPosts = await fetchLikedSavedPostsForUser(mongoId!, "saved");
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mongoId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
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
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text className="text-center">No saved posts found.</Text>
          }
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
};

export default SavedPosts;
