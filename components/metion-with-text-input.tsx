import { useMemo, useRef } from "react";
import React = require("react");
import {
  TextInput,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
  KeyboardAvoidingViewComponent,
  KeyboardAvoidingView,
} from "react-native";
import { useAuth } from "../contexts/auth-context";
import { Friend } from "../interfaces/user-interface";
import FriendMentionList from "../screens/posts/components/friends-mention-list";

interface MentionTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  // Additional props for TextInput can be passed via ...props.
  [key: string]: any;
}

const MentionTextInput: React.FC<MentionTextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  inputStyle,
  containerStyle,
  ...props
}) => {
  const { mongoUser } = useAuth();

  // Get accepted friends from your auth context.
  const acceptedFriends: Friend[] = useMemo(() => {
    return (mongoUser?.friends || []).filter((f) => f.status === "accepted");
  }, [mongoUser]);

  // Check if the value ends with an "@" trigger followed by word characters.
  const mentionMatch = useMemo(() => value.match(/@(\w*)$/), [value]);
  const mentionQuery = mentionMatch ? mentionMatch[1] : "";

  // Filter the accepted friends based on the mention query.
  const suggestionFriends = useMemo(() => {
    return acceptedFriends.filter(
      (friend) =>
        friend.data &&
        friend.data.username
          .toLowerCase()
          .startsWith(mentionQuery.toLowerCase())
    );
  }, [mentionQuery, acceptedFriends]);

  // Create a ref so we can re-focus the TextInput when a friend is selected.
  const textInputRef = useRef<TextInput>(null);

  // When a friend is tapped, replace the "@" trigger with the full username and re-focus.
  const handleSelectFriend = (friend: Friend) => {
    if (!friend.data) return;
    const mentionReplacement = `@${friend.data.username} `;
    const newText = value.replace(/@(\w*)$/, mentionReplacement);
    onChangeText(newText);
    textInputRef.current?.focus();
  };

  return (
    <View style={containerStyle}>
      {/* <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}> */}
      <View className="flex-1">
        <TextInput
          ref={textInputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={inputStyle}
          multiline={true}
          {...props}
        />
        {mentionMatch && (
          <FriendMentionList
            friends={suggestionFriends}
            onSelectFriend={handleSelectFriend}
            mentionQuery={mentionQuery}
          />
        )}
      </View>
      {/* </KeyboardAvoidingView> */}
    </View>
  );
};

export default MentionTextInput;
