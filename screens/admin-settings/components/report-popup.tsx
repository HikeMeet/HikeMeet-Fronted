import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";

type Props = {
  visible: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "user" | "post" | "trip";
};

const reasonOptions: Record<"user" | "post" | "trip", string[]> = {
  post: [
    "Spam or misleading",
    "Inappropriate content",
    "Violent or hateful content",
    "Copyright violation",
    "offensive images",
    "Other",
  ],
  user: [
    "Impersonation",
    "Harassment or bullying",
    "Inappropriate profile",
    "Fake identity",
    "Other",
  ],
  trip: [
    "False information",
    "Spam event",
    "Inappropriate location",
    "Scam or fraud",
    "Incompatible Images",
    "Other",
  ],
};

const ReportPopup = ({ visible, onClose, targetId, targetType }: Props) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReport = async () => {
    try {
      if (!selectedReason) {
        Alert.alert("Missing Reason", "Please select a reason.");
        return;
      }

      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to report.");

      const token = await user.getIdToken();

      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetId,
            targetType,
            reason: selectedReason === "Other" ? customNote : selectedReason,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit report.");
      }

      Alert.alert("Report Submitted", "Thank you for your feedback.");
      setSelectedReason(null);
      setCustomNote("");
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const reasons = reasonOptions[targetType];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <TouchableWithoutFeedback onPress={() => {}}>
            <View className="bg-white w-full rounded-2xl p-6 shadow-xl">
              <Text className="text-xl font-semibold mb-4 text-gray-800">
                Report this content
              </Text>

              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  className="flex-row items-center mb-3"
                >
                  <View
                    className={`w-5 h-5 mr-3 rounded-full border-2 ${
                      selectedReason === reason
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedReason === reason && (
                      <View className="w-full h-full rounded-full bg-blue-600" />
                    )}
                  </View>
                  <Text className="text-gray-800 text-sm">{reason}</Text>
                </TouchableOpacity>
              ))}

              {selectedReason === "Other" && (
                <>
                  <TextInput
                    value={customNote}
                    onChangeText={(text) => {
                      if (text.length <= 80) setCustomNote(text);
                    }}
                    placeholder="Write your reason..."
                    multiline
                    maxLength={80}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 mt-2"
                  />
                  <Text className="text-right text-xs text-gray-500 mt-1">
                    {customNote.length}/80 characters
                  </Text>
                </>
              )}

              <View className="flex-row justify-end mt-6 space-x-3">
                <TouchableOpacity
                  onPress={onClose}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  <Text className="text-gray-700">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={loading || !selectedReason}
                  onPress={submitReport}
                  className={`px-4 py-2 rounded-md ${
                    loading || !selectedReason ? "bg-blue-300" : "bg-blue-600"
                  }`}
                >
                  <Text className="text-white font-semibold">
                    {loading ? "Sending..." : "Send"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ReportPopup;
