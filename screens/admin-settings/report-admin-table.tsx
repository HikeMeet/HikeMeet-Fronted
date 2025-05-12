import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/auth-context";
import { IReport, ReportStatus } from "../../interfaces/report-interface";
import { Feather } from "@expo/vector-icons";

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
  const [openStatusModalId, setOpenStatusModalId] = useState<string | null>(
    null
  );
  const [searchText, setSearchText] = useState<string>("");

  // ---------- fetch ----------
  const fetchReports = useCallback(async () => {
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
  }, [getToken]);

  // ---------- optimistic PATCH ----------
  const updateStatus = async (reportId: string, newStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
    );

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

      if (!res.ok) {
        const { status: serverStatus } = await res.json();
        setReports((prev) =>
          prev.map((r) =>
            r._id === reportId ? { ...r, status: serverStatus } : r
          )
        );
        console.error("❌ Failed to update report:", await res.text());
      }
    } catch (err) {
      console.error("❌ Network error:", err);
    }
  };

  // ---------- refetch when screen gains focus ----------
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  // ---------- filtering & search ----------
  useEffect(() => {
    const base =
      filter === "all" ? reports : reports.filter((r) => r.status === filter);

    if (!searchText.trim()) {
      setFilteredReports(base);
    } else {
      const q = searchText.toLowerCase();
      setFilteredReports(
        base.filter(
          (r) =>
            r.reporter?.username?.toLowerCase().includes(q) ||
            r.reason?.toLowerCase().includes(q) ||
            r.targetType?.toLowerCase().includes(q)
        )
      );
    }
  }, [filter, reports, searchText]);

  // ---------- navigation helper ----------
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
      navigation.push("AccountStack", {
        screen: "UserProfile",
        params: { userId: targetId },
      });
    }
  };

  // ---------- render ----------
  const renderReport = ({ item }: { item: IReport }) => (
    <View className="relative border border-gray-300 rounded-xl p-4 mb-3">
      <TouchableOpacity
        onPress={() => navigateToTarget(item)}
        activeOpacity={0.8}
      >
        <Text className="font-bold text-sm">
          Reporter: {item.reporter?.username || "Unknown"}
        </Text>
        <Text className="text-s">Type: {item.targetType}</Text>
        <Text className="text-s">Reason: {item.reason}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          setOpenStatusModalId((prev) => (prev === item._id ? null : item._id))
        }
        className={`absolute top-2 right-2 px-2 py-1 rounded-full flex-row items-center space-x-1 ${STATUS_COLORS[item.status]}`}
      >
        <Text className="text-xs capitalize text-black font-semibold">
          {item.status.replace("_", " ")}
        </Text>
        <Feather name="chevron-down" size={14} color="#333" />
      </TouchableOpacity>

      <Modal
        visible={openStatusModalId === item._id}
        animationType="fade"
        transparent
        onRequestClose={() => setOpenStatusModalId(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center items-center"
          activeOpacity={1}
          onPress={() => setOpenStatusModalId(null)}
        >
          <View className="bg-white rounded-xl w-64 p-4">
            {(["pending", "in_progress", "resolved"] as ReportStatus[]).map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => {
                    updateStatus(item._id, status);
                    setOpenStatusModalId(null);
                  }}
                  className="py-2"
                >
                  <Text
                    className={`text-sm capitalize text-center ${
                      status === item.status
                        ? "text-blue-600 font-bold"
                        : "text-gray-800"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              )
            )}
            <TouchableOpacity
              onPress={() => setOpenStatusModalId(null)}
              className="mt-2"
            >
              <Text className="text-center text-xs text-gray-400">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* filters */}
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

      {/* search */}
      <View className="px-4 mb-3">
        <View className="flex-row items-center bg-gray-200 rounded-lg px-3 py-2">
          <TextInput
            placeholder="Search reports..."
            className="flex-1 text-sm"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x" size={18} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* list */}
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
