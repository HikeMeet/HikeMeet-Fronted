import React from "react";
import { ScrollView, TouchableOpacity, Image, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { IPost } from "../../../interfaces/post-interface";
import PostActions from "./post-action-buttons";

interface PostCardProps {
  post: IPost;
  navigation: any;
}

const PostCard: React.FC<PostCardProps> = ({ post, navigation }) => {
  // Extract author details
  const author =
    typeof post.author === "object"
      ? post.author
      : { username: post.author, profile_picture: { url: "" } };

  // Render header: profile picture, username, and timestamp.
  const renderHeader = () => (
    <View className="flex-row items-center p-2">
      {author.profile_picture?.url ? (
        <Image
          source={{ uri: author.profile_picture.url }}
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <View className="w-10 h-10 bg-gray-300 rounded-full" />
      )}
      <View className="ml-2">
        <Text className="font-bold text-base">{author.username}</Text>
        <Text className="text-xs text-gray-500">
          {new Date(post.created_at).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  // Render content area. If shared post, show the new post commentary and then a sub-card for the original post.
  const renderContent = () => {
    if (post.is_shared && post.original_post) {
      return (
        <View>
          {/* New post commentary */}
          {post.content ? (
            <Text className="p-2 text-base">{post.content}</Text>
          ) : null}
          {/* Sub-card for the original post */}
          <View className="bg-gray-100 p-2 rounded m-2">
            <Text className="text-xs text-gray-500 mb-1">Shared Post</Text>
            {typeof post.original_post === "object" ? (
              <>
                {post.original_post.content && (
                  <Text className="text-sm mb-2">
                    {post.original_post.content}
                  </Text>
                )}
                {post.original_post.images &&
                  post.original_post.images.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {post.original_post.images.map((img, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: img.url }}
                          className="w-32 h-32 rounded mr-2"
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}
              </>
            ) : (
              <Text className="text-sm">Original post details unavailable</Text>
            )}
          </View>
        </View>
      );
    } else {
      return (
        <View className="p-2">
          {post.content && (
            <Text className="text-base mb-2">{post.content}</Text>
          )}
          {post.images && post.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {post.images.map((img, idx) => {
                const isVideo = img.type === "video";
                const previewUrl = isVideo ? img.video_sceenshot_url : img.url;

                return (
                  <Image
                    key={idx}
                    source={{ uri: previewUrl }}
                    className="w-40 h-40 rounded mr-2"
                    resizeMode="cover"
                  />
                );
              })}
            </ScrollView>
          )}
        </View>
      );
    }
  };

  // Render footer: action buttons.
  const renderFooter = () => (
    <PostActions
      likes={post.likes.length}
      shares={post.shares.length}
      saves={post.saves.length}
      onLike={() => console.log("Like clicked!")}
      onShare={() => console.log("Share clicked!")}
      onSave={() => console.log("Save clicked!")}
    />
  );

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("PostStack", {
          screen: "PostPage",
          params: { postId: post._id },
        })
      }
      className="bg-white rounded-lg shadow mb-4"
    >
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </TouchableOpacity>
  );
};

export default PostCard;
