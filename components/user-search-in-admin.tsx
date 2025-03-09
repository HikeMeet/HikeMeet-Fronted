import React, { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  TouchableOpacity,
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
  const [localUsers, setLocalUsers] = useState<MongoUser[]>(users);

  // Update local state if parent users list changes
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  // Update user role in local list
  const handleUserRoleUpdate = (updatedUser: MongoUser) => {
    setLocalUsers((prevUsers) =>
      prevUsers.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
  };

  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) return localUsers;
    return localUsers.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      return (
        fullName.includes(searchText.toLowerCase()) ||
        user.username.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }, [searchText, localUsers]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="flex-1 bg-gray-100 rounded-lg p-4">
      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-200 rounded-lg p-3 mb-4">
        <Icon name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search Everything"
          className="flex-1 ml-2 text-sm"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")} className="ml-2">
            <Icon name="close" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* Users List */}
      <ScrollView>
        {filteredUsers.map((user) => (
          <UserRow
            key={user._id}
            user={user}
            onUserDeleted={onUserDeleted}
            navigation={navigation}
            onUserRoleUpdate={handleUserRoleUpdate}
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
