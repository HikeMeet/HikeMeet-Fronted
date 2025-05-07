import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // הוספת Picker
import { useAuth } from "../../contexts/auth-context";
import { IReport, ReportStatus } from "../../interfaces/report-interface";

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: "bg-yellow-200",
  in_progress: "bg-blue-200",
  resolved: "bg-green-200",
};

const FILTER_OPTIONS: (ReportStatus | "all")[] = [
  "all",
  "pending",
  "in_progress",
  "resolved",
];

const ReportAdminTable = ({ navigation }: { navigation: any }) => {
  const [reports, setReports] = useState<IReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus | "all">("all");
  const { getToken } = useAuth();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/report/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error("❌ Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId: string, newStatus: ReportStatus) => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/report/${reportId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) fetchReports();
    } catch (err) {
      console.error("❌ Failed to update report:", err);
    }
  };

  const navigateToTarget = (report: IReport) => {
    const { targetType, targetId } = report;
    if (targetType === "trip") {
      navigation.navigate("TripsStack", {
        screen: "TripPage",
        params: { tripId: targetId },
      });
    } else if (targetType === "post") {
      navigation.navigate("PostStack", {
        screen: "PostPage",
        params: { postId: targetId },
      });
    } else if (targetType === "user") {
      navigation.navigate("UserProfile", { userId: targetId });
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.status === filter));
    }
  }, [filter, reports]);

  const renderReport = ({ item }: { item: IReport }) => (
    <TouchableOpacity
      onPress={() => navigateToTarget(item)}
      className="border border-gray-300 rounded-xl p-4 mb-3"
    >
      <Text className="font-bold text-sm">
        Reporter: {item.reporter?.username || "Unknown"}
      </Text>
      <Text className="text-s">Type: {item.targetType}</Text>
      <Text className="text-s">Reason: {item.reason}</Text>
      <View className="flex-row justify-between items-center mt-2">
        <Text
          className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[item.status]}`}
        >
          Status: {item.status}
        </Text>

        {/* Dropdown Status Selector */}
        <View className="ml-4 border border-gray-300 rounded-md px-1 bg-white">
          <Picker
            selectedValue={item.status}
            onValueChange={(value: ReportStatus) =>
              updateStatus(item._id, value)
            }
            style={{ width: 130, height: 35 }}
            mode="dropdown"
          >
            <Picker.Item label="Pending" value="pending" />
            <Picker.Item label="In Progress" value="in_progress" />
            <Picker.Item label="Resolved" value="resolved" />
          </Picker>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="flex-1">
      <View className="flex-row justify-center mb-4 flex-wrap">
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setFilter(option)}
            className={`px-3 py-1 mx-1 my-1 rounded-full ${
              filter === option ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Text className="text-white text-xs capitalize">{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredReports}
        renderItem={renderReport}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

export default ReportAdminTable;
