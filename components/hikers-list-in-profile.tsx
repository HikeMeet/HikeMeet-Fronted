import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import UserRow from "./user-row-search";
import { useAuth } from "../contexts/auth-context";

interface HikersListProps {
  isMyProfile: boolean;
  navigation: any;
  profileId: string;
}

const HikersList: React.FC<HikersListProps> = ({
  isMyProfile,
  navigation,
  profileId,
}) => {
  const [activeTab, setActiveTab] = useState<string>("accepted");
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { mongoId } = useAuth(); // Current user's ID

  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, profileId]);

  const fetchFriends = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      let fetchedFriends: any[] = [];
      const baseUrl = `${process.env.EXPO_LOCAL_SERVER}/api/friend/${profileId}/friends?status=`;

      if (activeTab === "pending") {
        // For pending, combine both request_sent and request_received, and annotate each object
        const responseSent = await fetch(baseUrl + "request_sent");
        const responseReceived = await fetch(baseUrl + "request_received");

        if (!responseSent.ok || !responseReceived.ok) {
          throw new Error("Failed to fetch pending friends");
        }
        const dataSent = await responseSent.json();
        const dataReceived = await responseReceived.json();

        const sentFriends = (dataSent.friends || []).map((friend: any) => ({
          ...friend,
          friendStatus: "request_sent",
        }));
        const receivedFriends = (dataReceived.friends || []).map(
          (friend: any) => ({
            ...friend,
            friendStatus: "request_received",
          })
        );

        fetchedFriends = [...sentFriends, ...receivedFriends];
      } else {
        // For accepted and blocked, fetch directly and annotate if needed
        const response = await fetch(baseUrl + activeTab);
        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }
        const data = await response.json();
        fetchedFriends = (data.friends || []).map((friend: any) => ({
          ...friend,
          friendStatus: activeTab,
        }));
      }

      // If mongoId is provided, sort so that friend with that ID comes first
      if (mongoId) {
        fetchedFriends.sort((a, b) => {
          const aIsCurrent = String(a._id) === String(mongoId);
          const bIsCurrent = String(b._id) === String(mongoId);
          if (aIsCurrent && !bIsCurrent) return -1;
          if (!aIsCurrent && bIsCurrent) return 1;
          return 0;
        });
      }

      setFriends(fetchedFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4">
      {isMyProfile && (
        <View className="flex-row justify-around mb-4">
          <TouchableOpacity onPress={() => setActiveTab("accepted")}>
            <Text
              className={`text-base ${activeTab === "accepted" ? "font-bold" : "font-normal"}`}
            >
              Accepted
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("pending")}>
            <Text
              className={`text-base ${activeTab === "pending" ? "font-bold" : "font-normal"}`}
            >
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("blocked")}>
            <Text
              className={`text-base ${activeTab === "blocked" ? "font-bold" : "font-normal"}`}
            >
              Blocked
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Text className="text-xl font-bold mb-2">Hikers</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : friends.length > 0 ? (
        <ScrollView>
          {friends.map((friend, index) => (
            <UserRow
              key={friend._id || index}
              user={friend}
              // Use the external profileId here instead of mongoUser id.
              currentUserId={profileId}
              onStatusChange={(newStatus: string) =>
                console.log("Status changed:", newStatus)
              }
              navigation={navigation}
            />
          ))}
        </ScrollView>
      ) : (
        <Text className="text-gray-500">No hikers found.</Text>
      )}
    </View>
  );
};

export default HikersList;
