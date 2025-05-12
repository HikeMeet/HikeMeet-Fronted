import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/auth-context";
import { IReport, ReportStatus } from "../../interfaces/report-interface";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import ReportCard from "./components/report-card";
import ResolveAllButton from "./components/resolve-all-button";
import DeleteResolvedButton from "./components/delete-resolved-button";

const PAGE_SIZE = 6;

const FILTER_OPTIONS: (ReportStatus | "all")[] = [
  "all",
  "pending",
  "in_progress",
  "resolved",
];

const ReportAdminTable = ({ navigation }: { navigation: any }) => {
  const [reports, setReports] = useState<IReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<IReport[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus | "all">("all");
  const { getToken } = useAuth();
  const [openStatusModalId, setOpenStatusModalId] = useState<string | null>(
    null
  );
  const [searchText, setSearchText] = useState<string>("");

  // fetch all reports
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

  // ingle status update
  const updateStatus = async (reportId: string, newStatus: ReportStatus) => {
    const prev = reports;
    setReports((cur) =>
      cur.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
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
      if (!res.ok) throw await res.text();
    } catch (err) {
      console.error("❌ Failed to update report:", err);
      setReports(prev);
    }
  };

  //  delete single report
  const deleteReport = async (reportId: string) => {
    Alert.alert(
      "Delete report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const prev = reports;
            setReports((cur) => cur.filter((r) => r._id !== reportId));
            try {
              const token = await getToken();
              const res = await fetch(
                `${process.env.EXPO_LOCAL_SERVER}/api/report/${reportId}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw await res.text();
            } catch (err) {
              console.error(" Delete failed:", err);
              setReports(prev);
            }
          },
        },
      ]
    );
  };

  const loadMore = () => {
    if (visibleCount < filteredReports.length) {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredReports.length));
    }
  };

  //  refetch on focus
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  //  filtering & search
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
    setVisibleCount(PAGE_SIZE);
  }, [filter, reports, searchText]);

  //  navigation helper
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

  //  each card
  const renderReport = ({ item }: { item: IReport }) => (
    <ReportCard
      report={item}
      openStatusModalId={openStatusModalId}
      setOpenStatusModalId={setOpenStatusModalId}
      onNavigate={navigateToTarget}
      onDelete={deleteReport}
      onUpdateStatus={updateStatus}
    />
  );

  //  loading state
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
      <View className="flex-row justify-center mb-2 flex-wrap">
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setFilter(option)}
            className={`px-3 py-1 mx-1 my-1 rounded-full ${filter === option ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Text className="text-white text-xs capitalize">{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* search */}
      <View className="px-4 mb-2">
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

      <View className="flex-row items-center justify-around px-4 py-3 bg-white border-t border-gray-200">
        <ResolveAllButton
          reports={reports}
          setReports={setReports}
          getToken={getToken}
        />
        <DeleteResolvedButton
          reports={reports}
          setReports={setReports}
          getToken={getToken}
        />
      </View>

      {/* list */}
      <FlatList
        data={filteredReports.slice(0, visibleCount)}
        renderItem={renderReport}
        keyExtractor={(item) => item._id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={PAGE_SIZE}
        windowSize={5}
        removeClippedSubviews={true}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

export default ReportAdminTable;
