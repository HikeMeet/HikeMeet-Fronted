import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "tailwind-react-native-classnames";

interface PostProps {
  title: string;
  content: string;
  author: string;
}

export default function Post({ title, content, author }: PostProps) {
  return (
    <View style={tw`bg-white rounded-lg shadow-md p-4 mb-4`}>
      <Text style={tw`text-lg font-bold text-gray-800`}>{title}</Text>
      <Text style={tw`text-gray-600 mb-2`}>{content}</Text>
      <Text style={tw`text-sm text-gray-500`}>By: {author}</Text>
      <TouchableOpacity style={tw`mt-2`}>
        <Text style={tw`text-blue-500 underline text-sm`}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}
