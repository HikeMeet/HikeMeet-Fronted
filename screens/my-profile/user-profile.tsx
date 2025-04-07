import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BioSection from "./components/profile-bio-section";
import { useAuth } from "../../contexts/auth-context";
import FriendActionButton from "../../components/friend-button";
import HikersList from "../../components/hikers-list-in-profile";
import HikerButton from "../../components/profile-hikers-button";
import { MongoUser } from "../../interfaces/user-interface";
import ProfileImage from "../../components/profile-image";
import {
  blockUser,
  revokeFriendRequest,
} from "../../components/requests/user-actions";
import { fetchPostsForUser } from "../../components/requests/fetch-posts";
import PostCard from "../posts/components/post-card-on-feeds";
import { IPost } from "../../interfaces/post-interface";

interface UserProfileProps {
  route: any;
  navigation: any;
}

const UserProfile: React.FC<UserProfileProps> = ({ route, navigation }) => {
  const { userId } = route.params; // ID of the user to fetch
  const [user, setUser] = useState<MongoUser | null>(null); // User data
  const [friendStatus, setFriendStatus] = useState<string>("none"); // Friend status
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [showTooltip, setShowTooltip] = useState<boolean>(false); // Tooltip visibility
  const [showHikers, setShowHikers] = useState<boolean>(false); // Toggle for hikers list
  const { mongoId, mongoUser } = useAuth(); // Current user's ID
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);

  const toggleHikers = useCallback(() => {
    setShowHikers((prev) => !prev);
  }, []);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    await fetchPostsForUser(user!).then((posts) => setPosts(posts));
    console.log("Posts:", posts);
    setLoadingPosts(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  useEffect(() => {
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

        // Now fetch friend status by
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

  // Handlers for tooltip options
  const handleBlockUser = async () => {
    try {
      const data = await blockUser(mongoId!, userId);
      console.log("Block response:", data);
      setFriendStatus("blocked");
    } catch (error) {
      console.error("Error blocking user:", error);
    } finally {
      setShowTooltip(false);
    }
  };

  const renderPostsHeader = () => (
    <View className="p-4">
      <BioSection bio={user!.bio} />
      <View className="h-px bg-gray-300 my-4" />
    </View>
  );
  const handleRevokeRequest = async () => {
    try {
      const data = await revokeFriendRequest(mongoId!, userId);
      console.log("Revoke response:", data);
      setFriendStatus("none");
    } catch (error) {
      console.error("Error revoking friend request:", error);
    } finally {
      setShowTooltip(false);
    }
  };
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white ">
      {/* User Details */}
      <View className="flex-row items-center mb-4">
        <ProfileImage
          initialImageUrl={user.profile_picture.url}
          size={80}
          id={user._id}
          uploadType={"profile"}
          editable={false} // Only editable if the current user is the creator
        />
        <View>
          <Text className="text-xl font-bold">{`${user.username} ${user.last_name}`}</Text>
          <Text className="text-xl font-bold">{`${user.first_name} ${user.last_name}`}</Text>
          <Text className="text-sm text-gray-500">Rank: Adventurer</Text>
          {/* Hiker Button moved under the name and rank */}
          <HikerButton
            showHikers={showHikers}
            toggleHikers={toggleHikers}
            user={user}
          />
        </View>
      </View>

      {/* Friend Action Button and Tooltip */}
      {mongoId && (
        <View className="flex-row items-center">
          <FriendActionButton
            targetUserId={userId}
            status={friendStatus}
            onStatusChange={(newStatus: string) => setFriendStatus(newStatus)}
          />
          <TouchableOpacity
            onPress={() => setShowTooltip((prev) => !prev)}
            className="ml-2 p-2"
          >
            <Ionicons
              name="caret-up"
              size={16}
              color="black"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Tooltip Options */}
      {showTooltip && (
        <View className="mt-2 p-2 bg-white border border-gray-300 rounded shadow-md">
          <TouchableOpacity onPress={handleBlockUser} className="py-1 px-2">
            <Text className="text-sm text-gray-700">Block User</Text>
          </TouchableOpacity>
          {friendStatus === "request_received" && (
            <TouchableOpacity
              onPress={handleRevokeRequest}
              className="py-1 px-2"
            >
              <Text className="text-sm text-gray-700">Decline Request</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Conditional Rendering: Hikers List vs. Bio and Posts */}
      {showHikers ? (
        <HikersList
          isMyProfile={false}
          navigation={navigation}
          profileId={userId}
        />
      ) : (
        <>
          <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              // Replace with your actual PostCard component that displays a post.
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
            ListHeaderComponent={renderPostsHeader}
            refreshing={loadingPosts}
            onRefresh={fetchPosts}
            contentContainerStyle={{ paddingBottom: 220 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default UserProfile;
