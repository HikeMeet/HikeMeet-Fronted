import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MongoUser } from "../../interfaces/user-interface";
import UserSearchList from "../../components/user-search-in-admin";
import { useAuth } from "../../contexts/auth-context";
import TripsManage from "../../components/trip-manage-admin";
import { useFocusEffect } from "@react-navigation/native";

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
          className={`p-2 rounded-lg flex-1 mx-1 ${activeTab === tab.key ? "bg-blue-200" : "bg-gray-200"}`}
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
    { key: "user", label: "User Manage" },
    { key: "trips", label: "Trips Manage" },
    { key: "reports", label: "Reports" },
  ];

  // Fetch Users when user tab is active
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/all`
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const data: MongoUser[] = await response.json();

      // Sort so that current user is first, if available
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

  // Use useFocusEffect to re-fetch users when the screen comes into focus and the user tab is active
  useFocusEffect(
    useCallback(() => {
      if (activeTab === "user") {
        fetchUsers();
      }
    }, [activeTab])
  );

  // Render tab content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "user":
        return (
          <UserSearchList
            users={users}
            loading={loading}
            onUserDeleted={(mongoId: string) =>
              setUsers((prevUsers) =>
                prevUsers.filter((user) => user._id !== mongoId)
              )
            }
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white p-4">
          {/* Header */}
          <Text className="text-xl font-bold text-center mb-4">
            Admin Settings
          </Text>

          {/* Modular Tab Bar */}
          <TabBar tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />

          {/* Tab Content */}
          {renderContent()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdminSettingsPage;
