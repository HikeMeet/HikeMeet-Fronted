import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ReportButtonProps {
  targetId: string;
  targetType: string;
  positionClasses?: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({
  targetId,
  targetType,
  positionClasses,
}) => {
  const handleReport = () => {
    console.log(`Reporting ${targetType}: ${targetId}`);
  };

  return (
    <TouchableOpacity
      testID="report-button"
      onPress={handleReport}
      style={{ position: "absolute", top: 4, right: 24 }}
    >
      <Text testID="report-text">Report</Text>
    </TouchableOpacity>
  );
};

export default ReportButton;
