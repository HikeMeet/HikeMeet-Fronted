import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MongoUser } from "../../interfaces/user-interface";
import UserSearchList from "../../components/user-search-in-admin";
import { useAuth } from "../../contexts/auth-context";
import TripsManage from "../../components/trip-manage-admin";

interface Tab {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View className="flex-row justify-between mb-4">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabPress(tab.key)}
          className={`p-2 rounded-lg flex-1 mx-1 ${
            activeTab === tab.key ? "bg-blue-200" : "bg-gray-200"
          }`}
        >
          <Text className="text-center text-xs">{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AdminSettingsPage = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState("user");
  const [users, setUsers] = useState<MongoUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { mongoId } = useAuth(); // current user's mongoId

  const tabs: Tab[] = [
    { key: "users", label: "User Manage" },
    { key: "trips", label: "Trips Manage" },
    { key: "reports", label: "Reports" },
  ];

  // Fetch Users when user tab is active
  useEffect(() => {
    if (activeTab === "user") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/all`
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const data: MongoUser[] = await response.json();

      // If mongoId exists, sort the users so that the user with that ID comes first.
      if (mongoId) {
        data.sort((a, b) => {
          const aIsCurrent = String(a._id) === String(mongoId);
          const bIsCurrent = String(b._id) === String(mongoId);
          if (aIsCurrent && !bIsCurrent) return -1;
          if (!aIsCurrent && bIsCurrent) return 1;
          return 0;
        });
      }

      setUsers(data);
    } catch (error: any) {
      console.log(error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Callback function to update the user list after deletion
  const handleUserDeleted = (mongoId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== mongoId));
  };

  // Render tab content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "user":
        return (
          <UserSearchList
            users={users}
            loading={loading}
            onUserDeleted={handleUserDeleted}
            navigation={navigation}
          />
        );
      case "trips":
        return <TripsManage navigation={navigation} />;
      case "reports":
        return (
          <Text className="text-center text-gray-700">
            Reports Settings Content
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <Text className="text-xl font-bold text-center mb-4">Admin Settings</Text>

      {/* Modular Tab Bar */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />

      {/* Tab Content */}
      {renderContent()}
    </View>
  );
};

export default AdminSettingsPage;
