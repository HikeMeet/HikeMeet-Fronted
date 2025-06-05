import React from "react";
import { Alert, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { IReport } from "../../../interfaces/report-interface";

interface Props {
  reports: IReport[];
  setReports: React.Dispatch<React.SetStateAction<IReport[]>>;
  getToken: () => Promise<string | null>;
}

const DeleteResolvedButton: React.FC<Props> = ({
  reports,
  setReports,
  getToken,
}) => {
  const onPress = () =>
    Alert.alert("Delete resolved", "Remove all resolved reports permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const prev = reports;
          // optimistic UI
          setReports(prev.filter((r) => r.status !== "resolved"));

          try {
            const token = await getToken();
            const res = await fetch(
              `${process.env.EXPO_LOCAL_SERVER}/api/report/resolved`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (!res.ok) throw await res.text();
          } catch (err) {
            console.error("Bulk delete failed:", err);
            setReports(prev); // rollback
          }
        },
      },
    ]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center bg-rose-600 px-4 py-2 rounded-full shadow-sm"
    >
      <MaterialIcons name="delete-forever" size={16} color="#fff" />
      <Text className="ml-2 text-xs font-semibold text-white">
        Delete resolved
      </Text>
    </TouchableOpacity>
  );
};

export default DeleteResolvedButton;
