import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import tw from "tailwind-react-native-classnames";

interface PostProps {
  title: string;
  content: string;
  author: string;
  date: string;
  images: string[];
}

export default function Post({ title, content, author, date, images }: PostProps) {
  return (
    <View style={tw`bg-white rounded-lg shadow-md p-4 mb-4`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={{ uri: "https://via.placeholder.com/50" }}
            style={tw`w-10 h-10 rounded-full mr-3`}
          />
          <View>
            <Text style={tw`text-lg font-bold text-gray-800`}>{author}</Text>
            <Text style={tw`text-sm text-gray-500`}>{date}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={tw`text-blue-500 text-lg`}>✎</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={tw`text-gray-600 my-3`}>{content}</Text>

      {/* Images */}
      {images.length > 0 && (
        <ScrollView horizontal style={tw`flex-row mb-3`}>
          {images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={tw`w-32 h-32 mr-2 rounded-lg`}
            />
          ))}
        </ScrollView>
      )}

      {/* Actions */}
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row`}>
          <TouchableOpacity style={tw`mr-3`}>
            <Text style={tw`text-gray-500`}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`mr-3`}>
            <Text style={tw`text-gray-500`}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`mr-3`}>
            <Text style={tw`text-gray-500`}>⚠️</Text>
          </TouchableOpacity>
        </View>
        <Text style={tw`text-sm text-gray-500`}>{date}</Text>
      </View>
    </View>
  );
}
