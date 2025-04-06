import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import CreatePostButton from "../../posts/components/create-post-buton";
import PostCard from "../../posts/components/post-card-on-feeds";
import { useFocusEffect } from "@react-navigation/native";
import { IPost } from "../../../interfaces/post-interface";

interface GroupPostListProps {
  groupId: string;
  navigation: any;
  ListHeaderComponent?: React.ReactElement;
}

const GroupPostList: React.FC<GroupPostListProps> = ({
  groupId,
  navigation,
  ListHeaderComponent,
}) => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // New state: how many posts to render
  const [postsToShow, setPostsToShow] = useState<number>(5);

  const fetchGroupPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/all?inGroup=${groupId}`
      );
      const data = await res.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching group posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroupPosts();
    }, [groupId])
  );

  // Increase postsToShow by 5 when end of list is reached.
  const handleLoadMorePosts = useCallback(() => {
    if (postsToShow < posts.length) {
      setPostsToShow((prev) => prev + 5);
    }
  }, [postsToShow, posts.length]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center mt-10">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={posts.slice(0, postsToShow)}
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
      initialNumToRender={5}
      onEndReached={handleLoadMorePosts}
      onEndReachedThreshold={0.1}
      ListHeaderComponent={
        <>
          <CreatePostButton
            location="group"
            navigation={navigation}
            inGroup={true}
            groupId={groupId}
          />
          {ListHeaderComponent}
        </>
      }
      ListEmptyComponent={
        <Text className="text-center mt-8 text-gray-500">
          No posts in this group yet.
        </Text>
      }
      contentContainerStyle={{ paddingBottom: 15, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default GroupPostList;
