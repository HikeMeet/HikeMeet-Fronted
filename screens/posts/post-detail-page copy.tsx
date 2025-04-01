import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { IPost } from "../../interfaces/post-interface";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { SafeAreaView } from "react-native-safe-area-context";
import PostActions from "./components/post-action-buttons";
import { FontAwesome } from "@expo/vector-icons";

interface PostDetailPageRouteParams {
  postId: string;
  fromCreate?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Helper function to extract a URI string from a value.
const getUri = (data: any): string => {
  if (typeof data === "string") return data;
  if (
    data &&
    typeof data === "object" &&
    data.uri &&
    typeof data.uri === "string"
  ) {
    return data.uri;
  }
  return "";
};

// FullScreenVideo component using expo-video's API
interface FullScreenVideoProps {
  videoUrl: string;
}
const FullScreenVideo: React.FC<FullScreenVideoProps> = ({ videoUrl }) => {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.play();
  });
  // Listen to playing change events (optional)
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <VideoView
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain" // Using contentFit instead of resizeMode
      />
      <TouchableOpacity
        onPress={() => {
          if (isPlaying) {
            player.pause();
          } else {
            player.play();
          }
        }}
        style={{
          position: "absolute",
          bottom: 50,
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "black" }}>{isPlaying ? "Pause" : "Play"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const PostDetailPage: React.FC = () => {
  const route = useRoute();
  const { postId } = route.params as PostDetailPageRouteParams;
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/post/${postId}`
        );
        const data = await response.json();
        setPost(data.post);
        console.log(data.post);
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const openFullScreen = (index: number) => {
    setSelectedMediaIndex(index);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Post not found.</Text>
      </SafeAreaView>
    );
  }

  // Extract the author's profile picture URI (assuming profile_picture is an object with a uri property or a string).
  const authorProfilePic = getUri(
    typeof post.author === "object" ? post.author.profile_picture.url : ""
  );

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="bg-white">
          <View className="p-4">
            {/* Author Section */}
            <View className="flex-row items-center mb-4">
              {authorProfilePic ? (
                <Image
                  source={{ uri: authorProfilePic }}
                  className="w-12 h-12 rounded-full mr-3"
                />
              ) : (
                <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
              )}
              <Text className="text-lg font-bold">
                {typeof post.author === "object"
                  ? post.author.username
                  : post.author}
              </Text>
            </View>

            {/* Post Content */}
            {post.content ? (
              <Text className="text-base mb-4">{post.content}</Text>
            ) : null}

            {/* Media Section */}
            {/* Media Section */}
            {post.images &&
              Array.isArray(post.images) &&
              post.images.length > 0 && (
                <ScrollView horizontal className="mb-4">
                  {post.images.map((item, index) => {
                    // Use the video screenshot if it's a video, otherwise the normal URL
                    const uri =
                      item.type === "video"
                        ? item.video_sceenshot_url || getUri(item.url)
                        : getUri(item.url);
                    if (!uri) return null;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => openFullScreen(index)}
                      >
                        <View className="relative">
                          <Image
                            source={{ uri }}
                            className="w-64 h-64 rounded mr-2"
                            resizeMode="cover"
                          />
                          {item.type === "video" && (
                            <View className="absolute inset-0 justify-center items-center">
                              <FontAwesome
                                name="play-circle"
                                size={40}
                                color="white"
                              />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

            {/* Post Meta */}
            <Text className="text-sm text-gray-500 mb-2">
              Posted on: {new Date(post.created_at).toLocaleString()}
            </Text>

            {/* Post Actions: Likes and Shares */}
            <PostActions
              likes={post.likes.length}
              shares={post.shares.length}
              saves={post.saves.length}
              onLike={() => console.log("Like clicked!")}
              onShare={() => console.log("Share clicked!")}
              onSave={() => console.log("Save clicked!")}
            />

            {/* Comments */}
            {post.comments && post.comments.length > 0 && (
              <>
                <Text className="text-base font-semibold mb-2 mt-4">
                  Comments:
                </Text>
                {post.comments.map((comment, index) => (
                  <View key={index} className="mb-2">
                    <Text className="text-sm font-bold">
                      {typeof comment.user === "object"
                        ? comment.user.username
                        : comment.user}
                    </Text>
                    <Text className="text-sm">{comment.text}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Fullscreen Modal for Media Preview */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-black">
          {post.images &&
            post.images[selectedMediaIndex] &&
            (() => {
              const uri = getUri(post.images[selectedMediaIndex].url);
              if (!uri) return null;
              return post.images[selectedMediaIndex].type === "video" ? (
                <FullScreenVideo videoUrl={uri} />
              ) : (
                <Image
                  source={{ uri }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              );
            })()}
          <TouchableOpacity
            className="absolute top-10 right-5 bg-white/70 p-2 rounded-full"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-black text-lg">Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default PostDetailPage;
