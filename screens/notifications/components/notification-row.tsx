import React from "react";
import { View, Text } from "react-native";
import { styled } from "nativewind";
import { NotificationModel } from "../../../interfaces/notification-interface";

const StyledView = styled(View);
const StyledText = styled(Text);

interface NotificationRowProps {
  item: NotificationModel;
}

export const NotificationRow: React.FC<NotificationRowProps> = ({ item }) => {
  return (
    <StyledView
      className={`px-4 py-3 border-b border-gray-200 ${
        item.read ? "bg-white" : "bg-blue-50"
      }`}
    >
      <StyledText
        className={`text-base ${
          item.read ? "font-normal text-gray-800" : "font-bold text-black"
        }`}
      >
        {item.title}
      </StyledText>
      <StyledText className="mt-1 text-sm text-gray-700">
        {item.body}
      </StyledText>
      <StyledText className="mt-2 text-xs text-gray-500">
        {new Date(item.created_on).toLocaleString()}
      </StyledText>
    </StyledView>
  );
};
