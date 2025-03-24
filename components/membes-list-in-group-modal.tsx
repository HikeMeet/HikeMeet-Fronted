import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Group,
  GroupMember,
  GroupPending,
} from "../interfaces/group-interface";
import { useAuth } from "../contexts/auth-context";
import UserRow from "./user-row-search"; // Regular user row
import InviteUserRow from "./user-row-group-invite";
import tw from "tailwind-react-native-classnames";
import { useFocusEffect } from "@react-navigation/native";

interface MembersModalProps {
  visible: boolean;
  isAdmin: boolean;
  onClose: () => void;
  members: GroupMember[];
  pending: GroupPending[];
  group: Group;
  navigation: any;
}

const MembersModal: React.FC<MembersModalProps> = ({
  visible,
  isAdmin,
  onClose,
  members,
  pending,
  group,
  navigation,
}) => {
  const [selectedTab, setSelectedTab] = useState<"members" | "pending">(
    "members"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [membersData, setMembersData] = useState<any[]>([]);
  const [pendingData, setPendingData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const { mongoId } = useAuth();



  // Generic function to fetch full user data given an array of IDs.
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

  // Load members data (merging additional fields from GroupMember)
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

  // Load pending data (merging additional fields from GroupPending)
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
          created_at: info?.created_at,
        };
      });
      setPendingData(merged);
    } catch (error) {
      Alert.alert("Error", "Failed to load pending invites");
    } finally {
      setLoading(false);
    }
  };

  // When modal opens, load members data and reset search.
  useEffect(() => {
    if (visible) {
      setSearchText("");
      if (!isAdmin) setSelectedTab("members");
      if (members.length > 0) {
        loadMembersData();
      } else {
        setMembersData([]);
      }
    }
  }, [visible, isAdmin]);

  // Handle switching tabs (only available for admin users).
  const switchTab = (tab: "members" | "pending") => {
    setSelectedTab(tab);
    if (tab === "members" && membersData.length === 0) {
      loadMembersData();
    }
    if (tab === "pending" && pendingData.length === 0) {
      loadPendingData();
    }
  };

  // Filter the data based on searchText.
  const filteredData = () => {
    const data =
      isAdmin && selectedTab === "pending" ? pendingData : membersData;
    if (!searchText) return data;
    return data.filter((user) => {
      const fullName =
        `${user.username} ${user.first_name} ${user.last_name}`.toLowerCase();
      return fullName.includes(searchText.toLowerCase());
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
      >
        <View className="bg-white w-11/12 max-h-[80%] rounded-lg p-4">
          <Text className="text-xl font-bold mb-4 text-center">
            {isAdmin
              ? selectedTab === "members"
                ? "Members"
                : "Pending Invites"
              : "Members"}
          </Text>
          <TextInput
            className="w-full h-10 border border-gray-300 rounded px-2 mb-4"
            placeholder="Search by name or username"
            value={searchText}
            onChangeText={setSearchText}
          />
          {isAdmin && (
            <View className="flex-row justify-around mb-4">
              <TouchableOpacity
                onPress={() => switchTab("members")}
                className={`px-4 py-2 rounded ${
                  selectedTab === "members" ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <Text className="text-white text-sm font-semibold">
                  Members
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => switchTab("pending")}
                className={`px-4 py-2 rounded ${
                  selectedTab === "pending" ? "bg-yellow-500" : "bg-gray-300"
                }`}
              >
                <Text className="text-white text-sm font-semibold">
                  Pending ({pending.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : filteredData().length === 0 ? (
            <Text className="text-gray-600 text-center">
              No{" "}
              {isAdmin
                ? selectedTab === "members"
                  ? "members"
                  : "pending invites"
                : "members"}{" "}
              found.
            </Text>
          ) : (
            <ScrollView>
              {filteredData().map((user, index) =>
                isAdmin ? (
                  <InviteUserRow
                    key={user._id || index}
                    friend={user}
                    group={group}
                    navigation={navigation}
                  />
                ) : (
                  <UserRow
                    key={user._id || index}
                    user={user}
                    onStatusChange={(newStatus: string) =>
                      console.log("Status changed:", newStatus)
                    }
                    isMyProfile={false}
                    navigation={navigation}
                  />
                )
              )}
            </ScrollView>
          )}
          <TouchableOpacity
            onPress={onClose}
            className="bg-red-500 px-4 py-2 rounded mt-4 self-center"
          >
            <Text className="text-white text-sm font-semibold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MembersModal;
