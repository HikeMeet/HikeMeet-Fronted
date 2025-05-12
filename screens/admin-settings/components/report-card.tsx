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

const ReportCard: React.FC<Props> = ({
  report,
  openStatusModalId,
  setOpenStatusModalId,
  onNavigate,
  onDelete,
  onUpdateStatus,
}) => {
  const handleStatusPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    setOpenStatusModalId(openStatusModalId === report._id ? null : report._id);
  };

  const handleDelete = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onDelete(report._id);
  };

  return (
    <TouchableOpacity
      onPress={() => onNavigate(report)}
      activeOpacity={0.7}
      className="relative border border-gray-300 rounded-2xl p-6 mb-4 bg-white min-h-32"
    >
      <View>
        <Text className="font-bold text-sm">
          Reporter: {report.reporter?.username || "Unknown"}
        </Text>
        <Text className="text-s">Type: {report.targetType}</Text>
        <Text className="text-s">Reason: {report.reason}</Text>
      </View>

      <TouchableOpacity
        onPress={handleStatusPress}
        className={`absolute top-2 right-8 px-2 py-1 rounded-full flex-row items-center space-x-1 ${STATUS_COLORS[report.status]}`}
      >
        <Text className="text-xs capitalize text-black font-semibold">
          {report.status.replace("_", " ")}
        </Text>
        <Feather name="chevron-down" size={14} color="#333" />
      </TouchableOpacity>

      {/* delete icon */}
      <TouchableOpacity
        onPress={handleDelete}
        className="absolute top-2 right-2 p-1"
      >
        <MaterialIcons name="delete" size={18} color="#f44" />
      </TouchableOpacity>

      {/* status modal */}
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
