import { useState, useEffect, useCallback } from "react";
import React = require("react");
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
  headerComponent?: JSX.Element; // Optional header from ProfilePage.
}

const HikersList: React.FC<HikersListProps> = ({
  isMyProfile,
  navigation,
  profileId,
  headerComponent,
}) => {
  const [activeTab, setActiveTab] = useState<string>("accepted");
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
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

  // Local header that includes the tabs and search input.
  const renderLocalHeader = () => (
    <View className="ml-2 mr-2">
      {isMyProfile && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity onPress={() => setActiveTab("accepted")}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: activeTab === "accepted" ? "bold" : "normal",
              }}
            >
              Accepted
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("pending")}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: activeTab === "pending" ? "bold" : "normal",
              }}
            >
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("blocked")}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: activeTab === "blocked" ? "bold" : "normal",
              }}
            >
              Blocked
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
        Hikers
      </Text>
      <View style={{ marginBottom: 16 }}>
        <TextInput
          placeholder="Search hikers"
          value={searchText}
          onChangeText={setSearchText}
          style={{
            backgroundColor: "#f1f1f1",
            borderRadius: 25,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        />
      </View>
    </View>
  );

  // Combined header: parent's headerComponent (if provided) above the local header.
  const renderCombinedHeader = () => (
    <View>
      {headerComponent}
      {renderLocalHeader()}
    </View>
  );

  // Filter the friends list using the search text.
  const filteredFriends = friends.filter((friend) =>
    (friend.name || friend.username || "")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );
  const displayedFriends = filteredFriends.slice(0, friendsToShow);
  const loadMoreFriends = useCallback(() => {
    if (friendsToShow < filteredFriends.length) {
      setFriendsToShow((prev) => prev + 5);
    }
  }, [friendsToShow, filteredFriends.length]);

  return (
    <View className="flex-1 px-0">
      <FlatList
        data={displayedFriends}
        keyExtractor={(item, index) => item._id || String(index)}
        renderItem={({ item }) => (
          <View className="ml-2 mr-2">
            <UserRow
              user={item}
              onStatusChange={(newStatus: string) =>
                console.log("Status changed:", newStatus)
              }
              isMyProfile={isMyProfile}
              navigation={navigation}
            />
          </View>
        )}
        // Use the combined header so it always appears at the top.
        ListHeaderComponent={renderCombinedHeader}
        // ListEmptyComponent shows the ActivityIndicator only in the list area.
        ListEmptyComponent={
          loading ? (
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : null
        }
        onEndReached={loadMoreFriends}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
};

export default HikersList;
