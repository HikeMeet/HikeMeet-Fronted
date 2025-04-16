import { useState, useEffect, useCallback } from "react";
import React = require("react");
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
import tw from "twrnc";
import { MongoUser } from "../interfaces/user-interface";
import { useAuth } from "../contexts/auth-context";
import { Group } from "../interfaces/group-interface";
import InviteUserRow from "./user-row-group-invite";
import { fetchGroupDetails } from "./requests/fetch-group-and-users-data";

interface InviteFriendsModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;

  groupId: any;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  visible,
  onClose,
  navigation,
  groupId,
}) => {
  const [friends, setFriends] = useState<MongoUser[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<MongoUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [group, setGroup] = useState<Group | null>(null);
  const { mongoId } = useAuth();

  useEffect(() => {
    if (visible && group) {
      fetchFriends();
    }
  }, [visible, group]);

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGroupDetails(groupId, false);
      setGroup(data.group);
    } catch (error) {
      console.error("Error fetching group:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/friend/${mongoId}/friends?status=accepted`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch friends");
      }
      const data = await response.json();
      const friendsArray: MongoUser[] = Array.isArray(data.friends)
        ? data.friends
        : [];
      if (group) {
        // Filter out users that are already in group.members or group.pending
        const invitableFriends = friendsArray.filter((friend) => {
          const isMember = group.members.some(
            (member) => member.user === friend._id
          );
          const isPending = group.pending.some(
            (pending) => pending.user === friend._id
          );
          return !isMember && !isPending;
        });
        setFriends(invitableFriends);
        setFilteredFriends(invitableFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "Failed to load friend list.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text) {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter((friend) => {
        const fullName =
          `${friend.username} ${friend.first_name} ${friend.last_name}`.toLowerCase();
        return fullName.includes(text.toLowerCase());
      });
      setFilteredFriends(filtered);
    }
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
        <View className="bg-white w-11/12 max-h-4/5 rounded-lg p-4">
          <Text className="text-xl font-bold mb-4 text-center">
            Invite Friends to Group
          </Text>
          <TextInput
            className="w-full h-10 border border-gray-300 rounded px-2 mb-4"
            placeholder="Search friends"
            value={searchText}
            onChangeText={handleSearch}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : filteredFriends.length === 0 ? (
            <Text className="text-gray-600 text-center">No friends found.</Text>
          ) : (
            <ScrollView>
              {filteredFriends.map((friend) => (
                <InviteUserRow
                  key={friend._id}
                  friend={friend}
                  group={group!}
                  navigation={navigation}
                />
              ))}
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

export default InviteFriendsModal;
