import React from "react";
import { Alert, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { IReport } from "../../../interfaces/report-interface";

interface Props {
  reports: IReport[];
  setReports: React.Dispatch<React.SetStateAction<IReport[]>>;
  getToken: () => Promise<string | null>;
}

const ResolveAllButton: React.FC<Props> = ({
  reports,
  setReports,
  getToken,
}) => {
  /* -------- handler -------- */
  const onPress = () =>
    Alert.alert("Resolve all", "Mark every report as resolved?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          const prev = reports;
          // optimistic UI
          setReports(prev.map((r) => ({ ...r, status: "resolved" })));

          try {
            const token = await getToken();
            const res = await fetch(
              `${process.env.EXPO_LOCAL_SERVER}/api/report/resolve-all`,
              { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw await res.text();
          } catch (err) {
            console.error("Bulk resolve failed:", err);
            setReports(prev); // rollback
          }
        },
      },
    ]);

  /* -------- view -------- */
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center bg-emerald-600 px-4 py-2 rounded-full shadow-sm"
    >
      <MaterialIcons name="task-alt" size={16} color="#fff" />
      <Text className="ml-2 text-xs font-semibold text-white">Resolve all</Text>
    </TouchableOpacity>
  );
};

export default ResolveAllButton;
