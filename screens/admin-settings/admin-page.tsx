import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { MongoUser } from "../../interfaces/user-interface";
import UserRow from "../../components/user-row";

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("Users");
  const [users, setUsers] = useState<MongoUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Users
  useEffect(() => {
    if (activeTab === "Users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/all`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data: MongoUser[] = await response.json();
      setUsers(data);
    } catch (error: any) {
      console.log(error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Tab Content
  const renderContent = () => {
    if (activeTab === "Users") {
      if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
      }

      return (
        <ScrollView>
          {users.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              onButtonPress={() =>
                alert(`Action for ${user.first_name} ${user.last_name}`)
              }
            />
          ))}
        </ScrollView>
      );
    } else if (activeTab === "Trips Approve") {
      return (
        <Text className="text-center text-gray-700">
          Trips Approval Content
        </Text>
      );
    } else if (activeTab === "Button") {
      return (
        <Text className="text-center text-gray-700">
          Other Settings Content
        </Text>
      );
    }
    return null;
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <Text className="text-xl font-bold text-center mb-4">Admin Settings</Text>

      {/* Tab Buttons */}
      <View className="flex-row justify-between mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("Users")}
          className={`p-3 rounded-lg flex-1 mx-1 ${
            activeTab === "Users" ? "bg-blue-200" : "bg-gray-200"
          }`}
        >
          <Text className="text-center text-sm">Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Trips Approve")}
          className={`p-3 rounded-lg flex-1 mx-1 ${
            activeTab === "Trips Approve" ? "bg-blue-200" : "bg-gray-200"
          }`}
        >
          <Text className="text-center text-sm">Trips Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Button")}
          className={`p-3 rounded-lg flex-1 mx-1 ${
            activeTab === "Button" ? "bg-blue-200" : "bg-gray-200"
          }`}
        >
          <Text className="text-center text-sm">Button</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-200 rounded-lg p-3 mb-4">
        <Icon name="search" size={20} color="gray" />
        <TextInput placeholder="Search Everything" className="flex-1 text-sm" />
      </View>

      {/* Tab Content */}
      <View className="flex-1 bg-gray-100 rounded-lg p-4">
        {renderContent()}
      </View>
    </View>
  );
};

export default AdminSettingsPage;
