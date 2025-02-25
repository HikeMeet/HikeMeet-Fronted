import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import UserRow from "./user-row-admin";
import { MongoUser } from "../interfaces/user-interface";

interface UserSearchListProps {
  users: MongoUser[];
  loading: boolean;
  onUserDeleted: (mongoId: string) => void;
  navigation: any;
}

const UserSearchList: React.FC<UserSearchListProps> = ({
  users,
  loading,
  onUserDeleted,
  navigation,
}) => {
  const [searchText, setSearchText] = useState("");

  // Filter users based on search text
  const getFilteredUsers = () => {
    if (!searchText.trim()) return users;
    return users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      return (
        fullName.includes(searchText.toLowerCase()) ||
        user.username.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View>
      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-200 rounded-lg p-3 mb-4">
        <Icon name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search Everything"
          className="flex-1 ml-2 text-sm"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Users List */}
      <ScrollView>
        {filteredUsers.map((user) => (
          <UserRow
            key={user._id}
            user={user}
            onUserDeleted={onUserDeleted}
            navigation={navigation}
          />
        ))}
        {filteredUsers.length === 0 && (
          <Text className="text-center text-gray-500 mt-4">
            No users found.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default UserSearchList;
