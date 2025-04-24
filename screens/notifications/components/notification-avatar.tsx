import React, { useState, useEffect } from "react";
import { Image } from "react-native";

export const NotificationAvatar: React.FC<{
  groupImageUrl?: string;
  profileImageUrl?: string;
}> = ({ groupImageUrl, profileImageUrl }) => {
  // start out with whichever URI we think should win
  console.log("groupImageUrl", groupImageUrl);
  console.log("profileImageUrl", profileImageUrl);
  const initialSource = groupImageUrl
    ? { uri: groupImageUrl }
    : profileImageUrl
      ? { uri: profileImageUrl }
      : require("../../../assets/Logo2.png");
  console.log("initialSource", initialSource);
  const [source, setSource] = useState(initialSource);

  // if your business logic ever changes the URLs, update source too:
  useEffect(() => {
    setSource(
      groupImageUrl
        ? { uri: groupImageUrl }
        : profileImageUrl
          ? { uri: profileImageUrl }
          : require("../../../assets/Logo2.png")
    );
  }, [groupImageUrl, profileImageUrl]);

  return (
    <Image
      source={source}
      style={{ width: 40, height: 40, borderRadius: 20 }}
      onError={() => {
        // any network error or 404 will land here:
        setSource(require("../../../assets/Logo2.png"));
      }}
    />
  );
};
