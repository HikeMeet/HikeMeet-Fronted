import React from "react";
import { ScrollView, View, Text, TouchableOpacity, Modal } from "react-native";

interface TermsPopupProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsPopup({ visible, onClose }: TermsPopupProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        <View
          className="bg-white rounded-lg p-4 shadow-lg"
          style={{ width: "85%", maxWidth: "95%", maxHeight: "80%" }}
        >
          <TouchableOpacity
            className="absolute top-2 right-2"
            onPress={onClose}
          >
            <Text className="text-red-600 font-bold text-lg">X</Text>
          </TouchableOpacity>

          <ScrollView>
            <Text className="text-xl font-bold mb-2">1. Introduction</Text>
            <Text className="text-gray-700 mb-4">
              Welcome to HikeMeet! By using our application, you agree to comply
              with and be bound by these Terms and Conditions. Please read them
              carefully before using the app. If you do not agree with these
              terms, you must not use the app.
            </Text>

            <Text className="text-xl font-bold mb-2">2. Definitions</Text>
            <Text className="text-gray-700 mb-4">
              \"HikeMeet\" refers to the application and its associated
              services. \"User\" means any individual who accesses or uses the
              HikeMeet application. \"Content\" refers to any information, text,
              graphics, photos, videos, or other material uploaded, downloaded,
              or shared within the app.
            </Text>

            <Text className="text-xl font-bold mb-2">3. Eligibility</Text>
            <Text className="text-gray-700 mb-4">
              To use HikeMeet, you must be at least 18 years old, or have
              parental consent if under 18. You must provide accurate and
              complete registration information and agree to these Terms and
              Conditions and our Privacy Policy.
            </Text>

            <Text className="text-xl font-bold mb-2">
              4. User Responsibilities
            </Text>
            <Text className="text-gray-700 mb-4">
              Users are responsible for maintaining the confidentiality of their
              account credentials. They must ensure all content uploaded is
              lawful and does not infringe on the rights of others. Users must
              respect other users and refrain from harassing, abusive, or
              inappropriate behavior.
            </Text>

            <Text className="text-xl font-bold mb-2">
              5. Prohibited Activities
            </Text>
            <Text className="text-gray-700 mb-4">
              Users are prohibited from sharing illegal, harmful, or
              inappropriate content. They may not misrepresent their identity or
              affiliation, engage in activities that compromise the security or
              functionality of the app, or use the app for commercial purposes
              without prior authorization.
            </Text>

            <Text className="text-xl font-bold mb-2">
              6. Features of HikeMeet
            </Text>
            <Text className="text-gray-700 mb-4">
              HikeMeet provides the following features: Users can create or join
              travel groups. They can chat directly with other users or groups
              through Direct Messaging. Trip Creation allows planning and
              sharing trips with others. Content Sharing enables uploading
              photos, videos, and posts about trips. An Interactive Map helps
              explore trips and groups based on location. Interest Discovery
              lets users find others or trips based on shared interests.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
