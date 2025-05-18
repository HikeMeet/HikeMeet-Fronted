import { useEffect, useState, useCallback, useMemo } from "react";
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import BioSection from "./components/profile-bio-section";
import { useAuth } from "../../contexts/auth-context";
import FriendActionButton from "../../components/friend-button";
import HikersList from "../../components/hikers-list-in-profile";
import HikerButton from "../../components/profile-hikers-button";
import { MongoUser } from "../../interfaces/user-interface";
import ProfileImage from "../../components/profile-image";
import { fetchPostsForUser } from "../../components/requests/fetch-posts";
import PostCard from "../posts/components/post-card-on-feeds";
import { IPost } from "../../interfaces/post-interface";
import { getRankIcon } from "./components/rank-images";
import RankInfoModal from "./components/rank-info-modal";
import ReportButton from "../admin-settings/components/report-button";
import Ionicons from "react-native-vector-icons/Ionicons";

interface UserProfileProps {
  route: any;
  navigation: any;
}

const UserProfile: React.FC<UserProfileProps> = ({ route, navigation }) => {
  const { userId } = route.params; // ID of the user to fetch
  const [user, setUser] = useState<MongoUser | null>(null); // User data
  const [friendStatus, setFriendStatus] = useState<string>("none"); // Friend status
  const [loading, setLoading] = useState<boolean>(true); // Loading state for user
  const [showHikers, setShowHikers] = useState<boolean>(false); // Toggle for hikers list
  const { mongoId, mongoUser, fetchMongoUser } = useAuth(); // Current user's ID
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [showRankModal, setShowRankModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isPrivatePosts, setIsPrivatePosts] = useState(false);

  const rankName = user?.rank;
  const RankIcon = rankName ? getRankIcon(rankName) : null;

  const toggleHikers = useCallback(() => {
    setShowHikers((prev) => !prev);
  }, []);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      if (user && mongoId) {
        await fetchPostsForUser(user, mongoId).then((fetchedPosts) =>
          setPosts(fetchedPosts)
        );
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  useEffect(() => {
    fetchMongoUser(mongoId!);

    const fetchUser = async () => {
      setLoading(true);
      try {
        // Fetch user details.
        const response = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/user/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUser(data);

        const heBlockedMe = data.friends?.some(
          (f: any) => f.id === mongoId && f.status === "blocked"
        );

        if (friendStatus !== "blocked" || heBlockedMe) {
          setIsBlocked(true);
        }

        // check privacySettings
        const visibility = data.privacySettings?.postVisibility ?? "public";
        const isFriend = data.friends?.some(
          (f: any) => f.id === mongoId && f.status === "accepted"
        );

        if (visibility === "private" && !isFriend && userId !== mongoId) {
          setIsPrivatePosts(true);
          return;
        }

        // Now fetch friend status from current user's friends.
        if (mongoUser) {
          interface FriendObject {
            id: string;
            status: string;
          }
          type Friend = FriendObject | string;
          const friendData = mongoUser.friends as Friend[];
          const friend = friendData.find((f: Friend) => {
            if (typeof f === "object") {
              return f.id === userId;
            }
            return false;
          });
          const status =
            friend && typeof friend === "object" ? friend.status : "none";
          setFriendStatus(status);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [mongoId]);

  // Render header that stays at the top of the list.
  const renderPostsHeader = () => (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {user && (
        <View className="bg-white">
          {/* Profile Info Row */}
          <View className="flex-row items-center p-2">
            <View className="flex-col items-start p-4 bg-white">
              {/* Profile Image + Send Message button underneath */}
              <ProfileImage
                initialImage={user.profile_picture}
                size={80}
                id={user._id}
                uploadType={"profile"}
                editable={false}
              />
              {friendStatus !== "blocked" && (
                <TouchableOpacity
                  onPress={() => {
                    navigation.push("ChatStack", {
                      screen: "ChatRoomPage",
                      params: { user, type: "user" },
                    });
                  }}
                  className="mt-2 flex-row items-center border-2 border-blue-500 p-1 rounded-full bg-blue-500"
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={20}
                    color="white"
                  />
                  <Text className="ml-1 text-sm text-white">Send Message</Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-xl font-bold">{`${user.username}`}</Text>
              <Text className="text-sm font-bold">
                {`${user.first_name} ${user.last_name}`}
              </Text>

              {rankName && (
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setShowRankModal(true)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm text-gray-500 mr-2">
                      Rank: {rankName}
                    </Text>
                  </TouchableOpacity>

                  {RankIcon && (
                    <TouchableOpacity
                      onPress={() => setShowRankModal(true)}
                      activeOpacity={0.7}
                    >
                      <RankIcon width={24} height={24} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {friendStatus !== "blocked" && (
                <HikerButton
                  showHikers={showHikers}
                  toggleHikers={toggleHikers}
                  user={user}
                />
              )}
              {mongoId && (
                <View className="flex-row items-center">
                  <FriendActionButton
                    targetUserId={userId}
                    status={friendStatus}
                    onStatusChange={(newStatus: string) =>
                      setFriendStatus(newStatus)
                    }
                  />
                </View>
              )}
            </View>
          </View>
          {/* Bio Section Row */}
          <View className="p-4 bg-white">
            <View className="h-1 bg-gray-300 my-2" />
            {friendStatus !== "blocked" && (
              <BioSection bio={user!.bio} editable={false} />
            )}
          </View>
        </View>
      )}
    </>
  );

  // Memoize the header so that it's only computed once per dependency change.
  const memoizedHeader = useMemo(
    () => renderPostsHeader(),
    [user, friendStatus, showHikers]
  );

  if (loading) {
    // Full-page spinner only when the user data hasn't loaded yet.
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text>User not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {rankName && (
        <RankInfoModal
          visible={showRankModal}
          rankName={rankName}
          exp={user.exp}
          onClose={() => setShowRankModal(false)}
          isMyProfile={false}
        />
      )}

      {showHikers ? (
        // Pass the memoized header to HikersList.
        <HikersList
          isMyProfile={false}
          navigation={navigation}
          profileId={userId}
          headerComponent={memoizedHeader}
        />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View className="p-4">
                {friendStatus !== "blocked" && (
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
              </View>
            )}
            ListHeaderComponent={memoizedHeader}
            // Show a spinner below the header if posts are loading (and posts array is empty)
            ListEmptyComponent={
              loadingPosts ? (
                <View className="mt-20 items-center">
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              ) : isBlocked ? (
                <View className="mt-20 items-center px-16">
                  <Text className="text-16 text-red text-center">
                    This user is blocked. You cannot view their posts.
                  </Text>
                </View>
              ) : isPrivatePosts ? (
                <View className="mt-20 items-center px-16">
                  <Text className="text-16 text-gray-500 text-center">
                    This user's posts are private and visible to friends only.
                  </Text>
                </View>
              ) : (
                <View className="mt-20 items-center">
                  <Text className="text-16">No posts available.</Text>
                </View>
              )
            }
            refreshing={loadingPosts}
            onRefresh={fetchPosts}
            contentContainerStyle={{ paddingBottom: 220 }}
            showsVerticalScrollIndicator={false}
          />
        </KeyboardAvoidingView>
      )}
      <ReportButton
        targetId={userId}
        targetType="user"
        positionClasses="absolute top-2 right-4"
      />
    </SafeAreaView>
  );
};

export default UserProfile;
