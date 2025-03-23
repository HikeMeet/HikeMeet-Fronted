import React, { useState, useEffect } from "react";
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

interface InviteFriendsModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  visible,
  onClose,
  group,
}) => {
  const [friends, setFriends] = useState<MongoUser[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<MongoUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const { mongoId } = useAuth();

  useEffect(() => {
    if (visible) {
      fetchFriends();
    }
  }, [visible]);

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
      const friendsArray = Array.isArray(data.friends) ? data.friends : [];
      setFriends(friendsArray);
      setFilteredFriends(friendsArray);
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
        <View style={tw`bg-white w-11/12 max-h-4/5 rounded-lg p-4`}>
          <Text style={tw`text-xl font-bold mb-4 text-center`}>
            Invite Friends to Group
          </Text>
          <TextInput
            style={tw`w-full h-10 border border-gray-300 rounded px-2 mb-4`}
            placeholder="Search friends"
            value={searchText}
            onChangeText={handleSearch}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : filteredFriends.length === 0 ? (
            <Text style={tw`text-gray-600 text-center`}>No friends found.</Text>
          ) : (
            <ScrollView>
              {filteredFriends.map((friend) => (
                <InviteUserRow key={friend._id} friend={friend} group={group} />
              ))}
            </ScrollView>
          )}
          <TouchableOpacity
            onPress={onClose}
            style={tw`bg-red-500 px-4 py-2 rounded mt-4 self-center`}
          >
            <Text style={tw`text-white text-sm font-semibold`}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default InviteFriendsModal;
