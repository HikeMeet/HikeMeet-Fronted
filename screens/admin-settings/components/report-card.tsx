import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Modal,
  GestureResponderEvent,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { IReport, ReportStatus } from "../../../interfaces/report-interface";

/* ─────────  constants  ────────── */
const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: "bg-yellow-200",
  in_progress: "bg-blue-200",
  resolved: "bg-green-200",
};

interface Props {
  report: IReport;
  openStatusModalId: string | null;
  setOpenStatusModalId: (id: string | null) => void;
  onNavigate: (report: IReport) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ReportStatus) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/* ─────────  component  ────────── */
const ReportCard: React.FC<Props> = ({
  report,
  openStatusModalId,
  setOpenStatusModalId,
  onNavigate,
  onDelete,
  onUpdateStatus,
}) => {
  /* helpers */
  const handleStatusPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    setOpenStatusModalId(openStatusModalId === report._id ? null : report._id);
  };

  const handleDelete = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onDelete(report._id);
  };

  /* יעד – שם ידידותי או ID כ‑string */
  const targetLabel =
    report.targetName ??
    (typeof report.targetId === "string"
      ? report.targetId
      : String(report.targetId));

  return (
    <TouchableOpacity
      onPress={() => onNavigate(report)}
      activeOpacity={0.4}
      className="relative border border-gray-300 rounded-2xl p-5 mb-4 bg-white min-h-36"
    >
      {/* Header: reporter */}
      <View className="mb-2">
        <Text className="font-semibold text-base" numberOfLines={1}>
          {"Reporter: " + report.reporter?.username || "Unknown reporter"}
        </Text>
      </View>

      {/* Header: time */}
      <Text className="absolute bottom-2 right-3 text-xs text-gray-400">
        {formatDate(report.createdAt)}
      </Text>

      {/* Target info */}
      <Text className="text-xs text-gray-500 mb-1">
        Target: {report.targetType} – {targetLabel}
      </Text>

      {/* Owner of post (optional) */}
      {report.targetType === "post" && report.targetOwner && (
        <Text className="text-xs text-gray-500 mb-1">
          Post owner: {report.targetOwner}
        </Text>
      )}

      {/* Reason */}
      <Text className="text-sm text-gray-700 mb-4" numberOfLines={3}>
        Reason: {report.reason}
      </Text>

      {/* Status chip */}
      <TouchableOpacity
        onPress={handleStatusPress}
        className={`absolute top-2 right-9 px-3 py-1.5 rounded-full flex-row items-center space-x-1 ${STATUS_COLORS[report.status]}`}
      >
        <Text className="text-xs capitalize text-black font-semibold">
          {report.status.replace("_", " ")}
        </Text>
        <Feather name="chevron-down" size={14} color="#333" />
      </TouchableOpacity>

      {/* Delete icon */}
      <TouchableOpacity
        onPress={handleDelete}
        className="absolute top-2 right-2 p-1"
      >
        <MaterialIcons name="delete" size={20} color="#f44" />
      </TouchableOpacity>

      {/* Status modal */}
      <Modal
        visible={openStatusModalId === report._id}
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
                  onPress={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(report._id, status);
                    setOpenStatusModalId(null);
                  }}
                  className="py-2"
                >
                  <Text
                    className={`text-sm capitalize text-center ${
                      status === report.status
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
    </TouchableOpacity>
  );
};

export default ReportCard;
