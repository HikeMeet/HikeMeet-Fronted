import React from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface TimePickerPopupProps {
  visible: boolean;
  initialTime?: string; // Format "HH:mm"
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

const TimePickerPopup: React.FC<TimePickerPopupProps> = ({
  visible,
  initialTime,
  onConfirm,
  onCancel,
}) => {
  // Optionally, you can derive a default date from initialTime.
  // If initialTime is provided, parse it to set the default date.
  const defaultDate = (() => {
    if (initialTime) {
      const [hours, minutes] = initialTime.split(":").map(Number);
      const now = new Date();
      now.setHours(hours, minutes, 0, 0);
      return now;
    }
    return new Date();
  })();

  return (
    <DateTimePickerModal
      isVisible={visible}
      mode="time"
      date={defaultDate}
      display="spinner"
      is24Hour={true}
      onConfirm={(date: Date) => {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        onConfirm(`${hours}:${minutes}`);
      }}
      onCancel={onCancel}
    />
  );
};

export default TimePickerPopup;
