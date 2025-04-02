// ExpandableText.tsx
import React, { useState } from "react";
import { Text, View } from "react-native";

interface ExpandableTextProps {
  text: string;
  style?: object;
  disableExpand?: boolean; // New prop
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  style,
  disableExpand = false,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isTruncated, setIsTruncated] = useState<boolean>(false);

  const handleTextLayout = (e: any) => {
    if (e.nativeEvent.lines.length > 2) {
      setIsTruncated(true);
    }
  };

  return (
    <View>
      <Text
        style={style}
        numberOfLines={!expanded ? 2 : undefined}
        onTextLayout={handleTextLayout}
      >
        {text}
      </Text>
      {!disableExpand && isTruncated && (
        <Text
          onPress={() => setExpanded(!expanded)}
          style={{ color: "#3b82f6", marginTop: 4 }}
        >
          {expanded ? "Show less" : "Show more"}
        </Text>
      )}
    </View>
  );
};

export default ExpandableText;
