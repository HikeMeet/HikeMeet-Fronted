import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BioSection from "../../components/profile-bio-section";
import { useAuth } from "../../contexts/auth-context";
import FriendActionButton from "../../components/friend-button";
import HikersList from "../../components/hikers-list-in-profile";
import HikerButton from "../../components/profile-hikers-button";

interface UserProfileProps {
  route: any;
  navigation: any;
}

const UserProfile: React.FC<UserProfileProps> = ({ route, navigation }) => {
  const { userId } = route.params; // ID of the user to fetch
  const [user, setUser] = useState<any>(null); // User data
  const [friendStatus, setFriendStatus] = useState<string>("none"); // Friend status
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [showTooltip, setShowTooltip] = useState<boolean>(false); // Tooltip visibility
  const [showHikers, setShowHikers] = useState<boolean>(false); // Toggle for hikers list
  const { mongoId, mongoUser } = useAuth(); // Current user's ID

  const toggleHikers = useCallback(() => {
    setShowHikers((prev) => !prev);
  }, []);

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

        // Now fetch friend status by sending friendId in the query.
        if (mongoId) {
          const friendResponse = await fetch(
            `${process.env.EXPO_LOCAL_SERVER}/api/friend/${mongoId}?friendId=${userId}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );

          let status = "none";
          if (friendResponse.ok) {
            const friendData = await friendResponse.json();
            if (friendData.friends && friendData.friends.length > 0) {
              status = friendData.friends[0].status;
            }
          }
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
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/friend/block`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentUserId: mongoId,
            targetUserId: userId,
          }),
        }
      );
      const data = await response.json();
      console.log("Block response:", data);
      setFriendStatus("blocked");
    } catch (error) {
      console.error("Error blocking user:", error);
    } finally {
      setShowTooltip(false);
    }
  };

  const handleRevokeRequest = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/friend/revoke-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentUserId: mongoId,
            targetUserId: userId,
          }),
        }
      );
      const data = await response.json();
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Ionicons name="notifications" size={24} color="black" />
      </View>

      <ScrollView className="p-4">
        {/* User Details */}
        <View className="flex-row items-center mb-4">
          <Image
            source={{
              uri: user.profile_picture || "https://via.placeholder.com/150",
            }}
            className="w-24 h-24 rounded-full mr-4"
          />
          <View>
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
              currentUserId={mongoId}
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
            {/* Bio Section - Read-only */}
            <BioSection bio={user.bio} editable={false} />

            {/* Divider */}
            <View className="h-px bg-gray-300 my-4" />

            {/* Example Posts */}
            <Text className="text-lg font-bold mb-2">Posts</Text>
            {[1, 2, 3].map((post, index) => (
              <View
                key={index}
                className="mb-4 p-4 bg-gray-100 rounded-lg shadow-sm"
              >
                <Text className="text-sm text-gray-800">Post {index + 1}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;
