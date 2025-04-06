import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
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
  // New state for search text
  const [searchText, setSearchText] = useState<string>("");
  // New state: show only 5 friends initially.
  const [friendsToShow, setFriendsToShow] = useState<number>(5);
  const { mongoId } = useAuth();

  useEffect(() => {
    fetchFriends();
  }, [activeTab, profileId]);

  const fetchFriends = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      let fetchedFriends: any[] = [];
      const baseUrl = `${process.env.EXPO_LOCAL_SERVER}/api/friend/${profileId}/friends?status=`;

      if (activeTab === "pending") {
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

  // Filter friends using searchText.
  let filteredFriends = friends.filter((friend) =>
    (friend.name || friend.username || "")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  // Pagination: only display a slice of the filtered friends.
  const displayedFriends = filteredFriends.slice(0, friendsToShow);
  const loadMoreFriends = useCallback(() => {
    if (friendsToShow < filteredFriends.length) {
      setFriendsToShow((prev) => prev + 5);
    }
  }, [friendsToShow, filteredFriends.length]);

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
      {/* Search TextInput */}
      <Text className="text-xl font-bold mb-2">Hikers</Text>
      <View className="mb-4">
        <TextInput
          placeholder="Search hikers"
          value={searchText}
          onChangeText={setSearchText}
          className="bg-gray-100 rounded-full px-3 py-2 text-base"
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : filteredFriends.length > 0 ? (
        <FlatList
          data={displayedFriends}
          keyExtractor={(item, index) => item._id || String(index)}
          renderItem={({ item, index }) => (
            <UserRow
              key={item._id || index}
              user={item}
              onStatusChange={(newStatus: string) =>
                console.log("Status changed:", newStatus)
              }
              isMyProfile={isMyProfile}
              navigation={navigation}
            />
          )}
          onEndReached={loadMoreFriends}
          onEndReachedThreshold={0.1}
        />
      ) : (
        <Text className="text-gray-500">No hikers found.</Text>
      )}
    </View>
  );
};

export default HikersList;
