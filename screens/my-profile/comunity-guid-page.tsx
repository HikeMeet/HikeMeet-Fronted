import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CommunityGuidelinesProps {
  navigation: any;
}

const CommunityGuidelines: React.FC<CommunityGuidelinesProps> = ({
  navigation,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-300">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold">
          Community Guidelines
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-lg font-bold mb-2">Welcome to Our Community</Text>
        <Text className="mb-4 text-gray-700">
          We are thrilled to have you as part of our community. Our app is
          designed to foster a positive, supportive environment for everyone.
          Please take a moment to read through our guidelines to ensure that
          everyone enjoys a respectful and inclusive experience.
        </Text>

        <Text className="text-lg font-bold mb-2">Respect and Courtesy</Text>
        <Text className="mb-4 text-gray-700">
          Treat every member with respect. Any form of harassment, hate speech,
          or discriminatory language is strictly prohibited. We encourage you to
          engage in constructive conversations and support one another.
        </Text>

        <Text className="text-lg font-bold mb-2">Content Guidelines</Text>
        <Text className="mb-4 text-gray-700">
          Please ensure that any content you share on our app is appropriate and
          aligns with our community values. Avoid posting explicit, violent, or
          otherwise inappropriate content. Remember, our content should
          contribute positively to our community.
        </Text>

        <Text className="text-lg font-bold mb-2">Privacy and Security</Text>
        <Text className="mb-4 text-gray-700">
          Respect the privacy of others. Do not share personal information
          without consent, and report any suspicious activity to our support
          team immediately. Your safety is our top priority.
        </Text>

        <Text className="text-lg font-bold mb-2">Feedback and Reporting</Text>
        <Text className="mb-4 text-gray-700">
          We value your feedback and encourage you to report any violations of
          these guidelines. Please use the in-app reporting features to notify
          us of any behavior that disrupts our community. Our team is dedicated
          to maintaining a safe environment.
        </Text>

        <Text className="text-lg font-bold mb-2">Enforcement</Text>
        <Text className="mb-4 text-gray-700">
          Failure to comply with these guidelines may result in content removal
          or account suspension. We reserve the right to enforce these
          guidelines to maintain a healthy community for everyone.
        </Text>

        <Text className="text-lg font-bold mb-2">Thank You</Text>
        <Text className="mb-4 text-gray-700">
          Thank you for helping us create a vibrant and welcoming community.
          Enjoy your time in our app and feel free to reach out if you have any
          questions.
        </Text>

        {/* Optional button to acknowledge guidelines */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white text-center font-semibold">
            I Understand
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CommunityGuidelines;
