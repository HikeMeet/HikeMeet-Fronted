import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

const LtrText: React.FC<TextProps> = ({ style, children, ...rest }) => {
  return (
    <Text
      {...rest}
      style={[styles.ltr, style]} // first apply default LTR style, then custom
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  ltr: {
    textAlign: "left",
    writingDirection: "ltr",
  },
});

export default LtrText;
