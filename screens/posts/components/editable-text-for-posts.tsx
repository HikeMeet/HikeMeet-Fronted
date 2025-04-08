// EditableText.tsx
import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import MentionTextInput from "../../../components/metion-with-text-input";

interface EditableTextProps {
  text: string;
  postId: string;
  isEditing: boolean;
  onSaveComplete: (updatedText: string) => void;
  onCancel: () => void;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const EditableText: React.FC<EditableTextProps> = ({
  text,
  postId: updateUrl,
  isEditing,
  onSaveComplete,
  onCancel,
  textStyle,
  containerStyle,
}) => {
  const [editedText, setEditedText] = useState(text);
  const [loading, setLoading] = useState(false);

  // Update internal text if the prop changes.
  useEffect(() => {
    setEditedText(text);
  }, [text]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/${updateUrl}/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editedText }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        onSaveComplete(data.post.content);
      } else {
        console.error("Error updating post:", data.error);
      }
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <View style={containerStyle}>
        <View className="flex-row items-center">
          <MentionTextInput
            placeholder="Write a comment..."
            value={editedText}
            onChangeText={setEditedText}
            inputStyle={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 8,
              fontSize: 16,
              color: "#374151",
            }}
            containerStyle={{ flex: 1 }}
          />
          {/* You may add a Send button here if needed */}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 8,
          }}
        >
          <TouchableOpacity onPress={onCancel}>
            <Text style={{ color: "#6b7280" }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            {loading ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Text style={{ color: "#2563EB" }}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // When not editing, simply display the text.
  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};

export default EditableText;
