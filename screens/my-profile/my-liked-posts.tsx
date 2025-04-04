import React, { useEffect, useState, useCallback } from "react";
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
import { fetchLikedPostsForUser } from "../../components/requests/fetch-posts";

interface LikedPostsProps {
  route: any;
  navigation: any;
}

const LikedPosts: React.FC<LikedPostsProps> = ({ route, navigation }) => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { mongoId } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      const fetchedPosts = await fetchLikedPostsForUser(mongoId!, "liked");
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching liked posts:", error);
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
            <PostCard post={item} navigation={navigation} />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text className="text-center">No liked posts found.</Text>
          }
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
};

export default LikedPosts;
