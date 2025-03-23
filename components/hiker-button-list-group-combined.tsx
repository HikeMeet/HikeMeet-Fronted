import React, { useState } from "react";
import { 
  View, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import tw from "twrnc";
import UserRow from "./user-row-search"; // adjust path as needed
import { GroupMember, GroupPending } from "../interfaces/group-interface";

interface HikersSwitcherProps {
  members: GroupMember[];
  pending: GroupPending[];
  navigation: any;
  isAdmin: boolean;
}

const HikersSwitcher: React.FC<HikersSwitcherProps> = ({
  members,
  pending,
  navigation,
  isAdmin,
}) => {
  // Controls whether the list area is visible (toggled by the main Hikers button)
  const [showList, setShowList] = useState(false);
  // Which tab is active ("members" or "pending"). For non-admins, always "members".
  const [selectedTab, setSelectedTab] = useState<"members" | "pending">("members");

  // Data and loading states for full user info
  const [membersData, setMembersData] = useState<any[]>([]);
  const [pendingData, setPendingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Generic function to fetch user data given an array of IDs.
  const fetchUsersData = async (ids: string[]): Promise<any[]> => {
    try {
      const idsString = ids.join(",");
      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/list-by-ids?ids=${idsString}`
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    } catch (error) {
      console.error("Error fetching users data:", error);
      throw error;
    }
  };

  // Fetch and merge members data (adds role and joined_at).
  const loadMembersData = async () => {
    if (members.length === 0) {
      setMembersData([]);
      return;
    }
    setLoading(true);
    try {
      const ids = members.map((m) => m.user);
      const users = await fetchUsersData(ids);
      const merged = users.map((user: any) => {
        const info = members.find((m) => m.user === user._id);
        return { ...user, role: info?.role, joined_at: info?.joined_at };
      });
      setMembersData(merged);
    } catch (error) {
      Alert.alert("Error", "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  // Fetch and merge pending data (adds origin, status, created_at).
  const loadPendingData = async () => {
    if (pending.length === 0) {
      setPendingData([]);
      return;
    }
    setLoading(true);
    try {
      const ids = pending.map((p) => p.user);
      const users = await fetchUsersData(ids);
      const merged = users.map((user: any) => {
        const info = pending.find((p) => p.user === user._id);
        return { 
          ...user, 
          origin: info?.origin, 
          status: info?.status, 
          created_at: info?.created_at 
        };
      });
      setPendingData(merged);
    } catch (error) {
      Alert.alert("Error", "Failed to load pending invites");
    } finally {
      setLoading(false);
    }
  };

  // Toggle the entire list open/closed.
  const toggleList = () => {
    if (!showList) {
      // When opening, default to "members" tab.
      setSelectedTab("members");
      if (members.length === 0) {
        setMembersData([]);
      } else if (membersData.length === 0) {
        loadMembersData();
      }
    }
    setShowList(!showList);
  };

  // Handle switching tabs (for admin users).
  const switchTab = (tab: "members" | "pending") => {
    setSelectedTab(tab);
    if (tab === "members") {
      if (members.length === 0) {
        setMembersData([]);
      } else if (membersData.length === 0) {
        loadMembersData();
      }
    } else if (tab === "pending") {
      if (pending.length === 0) {
        setPendingData([]);
      } else if (pendingData.length === 0) {
        loadPendingData();
      }
    }
  };

  return (
    <View>
      {/* Main "Hikers" Toggle Button */}
      <TouchableOpacity
        onPress={toggleList}
        style={tw`bg-green-500 px-4 py-2 rounded self-start mt-4`}
      >
        <Text style={tw`text-white text-sm font-semibold`}>
          Hikers ({members.length})
        </Text>
      </TouchableOpacity>

      {showList && (
        <View style={tw`mt-4`}>
          {isAdmin && (
            // For admin users, show two tabs regardless of list content.
            <View style={tw`flex-row justify-around mb-4`}>
              <TouchableOpacity
                onPress={() => switchTab("members")}
                style={[
                  tw`px-4 py-2 rounded`,
                  selectedTab === "members" ? tw`bg-green-500` : tw`bg-gray-300`,
                ]}
              >
                <Text style={tw`text-white text-sm font-semibold`}>
                  Members
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => switchTab("pending")}
                style={[
                  tw`px-4 py-2 rounded`,
                  selectedTab === "pending" ? tw`bg-yellow-500` : tw`bg-gray-300`,
                ]}
              >
                <Text style={tw`text-white text-sm font-semibold`}>
                  Pending ({pending.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Render list based on selected tab; non-admin users always see "members". */}
          {selectedTab === "members" || !isAdmin ? (
            loading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : members.length === 0 ? (
              <Text style={tw`text-gray-800 text-sm`}>
                No members joined yet.
              </Text>
            ) : membersData.length === 0 ? (
              <Text style={tw`text-gray-800 text-sm`}>
                No members found.
              </Text>
            ) : (
              <ScrollView>
                {membersData.map((user, idx) => (
                  <UserRow
                    key={user._id || idx}
                    user={user}
                    onStatusChange={(newStatus: string) =>
                      console.log(newStatus)
                    }
                    navigation={navigation}
                  />
                ))}
              </ScrollView>
            )
          ) : (
            // Pending tab.
            loading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : pending.length === 0 ? (
              <Text style={tw`text-gray-800 text-sm`}>
                No pending invites joined yet.
              </Text>
            ) : pendingData.length === 0 ? (
              <Text style={tw`text-gray-800 text-sm`}>
                No pending invites found.
              </Text>
            ) : (
              <ScrollView>
                {pendingData.map((user, idx) => (
                  <UserRow
                    key={user._id || idx}
                    user={user}
                    onStatusChange={(newStatus: string) =>
                      console.log(newStatus)
                    }
                    navigation={navigation}
                  />
                ))}
              </ScrollView>
            )
          )}
        </View>
      )}
    </View>
  );
};

export default HikersSwitcher;
