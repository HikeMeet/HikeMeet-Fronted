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
import { checkRankLevel } from "./components/check-rank-level";
import { RankInfo } from "../../interfaces/rank-info";
import RankInfoModal from "./components/rank-info-modal";
import ReportButton from "../admin-settings/components/report-button";

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

  // Compute rank info once user is loaded
  const rankInfo: RankInfo | null = useMemo(
    () => (user ? checkRankLevel(user.exp) : null),
    [user]
  );

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
    fetchMongoUser(mongoId!);
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

        // check Blocked
        const iBlockedHim = mongoUser?.friends?.some(
          (f) => f.id === userId && f.status === "blocked"
        );

        const heBlockedMe = data.friends?.some(
          (f: any) => f.id === mongoId && f.status === "blocked"
        );

        if (iBlockedHim || heBlockedMe) {
          setIsBlocked(true);
          return;
        }

        // check privacySettings
        const visibility = data.privacySettings?.postVisibility ?? "public";
        const isFriend = data.friends?.some(
          (f: any) => f.id === mongoId && f.status === "accepted"
        );

        if (visibility === "friends" && !isFriend && userId !== mongoId) {
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
  }, [userId, mongoId]);

  // Render header that stays at the top of the list.
  const renderPostsHeader = () => (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {user && (
        <View className="bg-white">
          {/* Profile Info Row */}
          <View className="flex-row items-center p-4">
            <ProfileImage
              initialImage={user.profile_picture}
              size={80}
              id={user._id}
              uploadType={"profile"}
              editable={false}
            />

            <View className="flex-1 ml-2">
              <Text className="text-xl font-bold">
                {`${user.username} ${user.last_name}`}
              </Text>
              <Text className="text-sm font-bold">
                {`${user.first_name} ${user.last_name}`}
              </Text>

              {rankInfo && (
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setShowRankModal(true)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm text-gray-500 mr-2">
                      Rank: {rankInfo.rankName}
                    </Text>
                  </TouchableOpacity>

                  {rankInfo?.rankImageUrl && (
                    <TouchableOpacity
                      onPress={() => setShowRankModal(true)}
                      activeOpacity={0.7}
                    >
                      <rankInfo.rankImageUrl width={24} height={24} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <HikerButton
                showHikers={showHikers}
                toggleHikers={toggleHikers}
                user={user}
              />
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
            <View className="h-px bg-gray-300 my-2" />
            <BioSection bio={user!.bio} editable={false} />
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
      {rankInfo && (
        <RankInfoModal
          visible={showRankModal}
          rankInfo={rankInfo}
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
              </View>
            )}
            ListHeaderComponent={memoizedHeader}
            // Show a spinner below the header if posts are loading (and posts array is empty)
            ListEmptyComponent={
              loadingPosts ? (
                <View style={{ marginTop: 20, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              ) : isBlocked ? (
                <View
                  style={{
                    marginTop: 20,
                    alignItems: "center",
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, color: "red", textAlign: "center" }}
                  >
                    This user is blocked. You cannot view their posts.
                  </Text>
                </View>
              ) : isPrivatePosts ? (
                <View
                  style={{
                    marginTop: 20,
                    alignItems: "center",
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, color: "gray", textAlign: "center" }}
                  >
                    This user's posts are private and visible to friends only.
                  </Text>
                </View>
              ) : (
                <View style={{ marginTop: 20, alignItems: "center" }}>
                  <Text>No posts available.</Text>
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
