import React from "react";
import { View } from "react-native";

interface StaticProfileHeaderProps {
  profileHeaderContent: React.ReactNode;
}

const StaticProfileHeader: React.FC<StaticProfileHeaderProps> = React.memo(
  ({ profileHeaderContent }) => {
    return <View>{profileHeaderContent}</View>;
  }
);

export default StaticProfileHeader;
