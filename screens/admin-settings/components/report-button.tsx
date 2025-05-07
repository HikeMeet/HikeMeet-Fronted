import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import ReportPopup from "./report-popup";
import ReportIcon from "../../../assets/report.svg";

type Props = {
  targetId: string;
  targetType: "user" | "post" | "trip";
  positionClasses?: string; // className string like "absolute top-2 right-4"
};

const ReportButton: React.FC<Props> = ({
  targetId,
  targetType,
  positionClasses = "absolute top-2 right-4",
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className={`${positionClasses} bg-red-100 p-2 rounded-full`}
      >
        <ReportIcon width={20} height={20} />
      </TouchableOpacity>

      <ReportPopup
        visible={visible}
        onClose={() => setVisible(false)}
        targetId={targetId}
        targetType={targetType}
      />
    </>
  );
};

export default ReportButton;
