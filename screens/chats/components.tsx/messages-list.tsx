import React, { useRef, useState, useEffect } from "react";
import { FlatList, View, Text, ActivityIndicator } from "react-native";
import { IMessage } from "../../../interfaces/chat-interface";
import { MongoUser } from "../../../interfaces/user-interface";
import {
  collection,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../../firebaseconfig";
import { getRoomId } from "../../../utils/chat-utils";
import MessageItem from "./messge-item";

interface MessagesListProps {
  messages: IMessage[];
  currntUser: MongoUser;
  otherUserId: string;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currntUser,
  otherUserId,
}) => {
  const flatListRef = useRef<FlatList<IMessage>>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<IMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageDoc, setOldestMessageDoc] = useState<any>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [maintainPosition, setMaintainPosition] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  // Initial load of latest 20 messages
  useEffect(() => {
    if (initialLoad && messages.length > 0) {
      const latestMessages = messages.slice(-20);
      setDisplayedMessages(latestMessages);

      if (latestMessages.length > 0) {
        setOldestMessageDoc(latestMessages[0].createdAt);
      }

      setInitialLoad(false);

      // Scroll to bottom on initial load with animation after a short delay
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } else if (!initialLoad && messages.length > 0) {
      // Update with new messages that might have arrived
      const newMessages = messages.filter(
        (msg) =>
          !displayedMessages.some(
            (dMsg) =>
              dMsg.userId === msg.userId &&
              dMsg.createdAt.toDate().getTime() ===
                msg.createdAt.toDate().getTime() &&
              dMsg.text === msg.text
          )
      );

      if (newMessages.length > 0) {
        setDisplayedMessages((prev) => [...prev, ...newMessages]);

        // When new messages arrive, auto-scroll to bottom with animation
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  }, [messages, initialLoad]);

  const loadMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingMore || !oldestMessageDoc) return;

    setIsLoadingMore(true);
    setMaintainPosition(true);
    setPrevMessagesLength(displayedMessages.length);

    try {
      const roomId = getRoomId(currntUser.firebase_id, otherUserId);
      const docRef = doc(FIREBASE_DB, "rooms", roomId);
      const messagesRef = collection(docRef, "messages");

      // Create a query to get the previous 20 messages
      const q = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        startAfter(oldestMessageDoc),
        limit(20)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMoreMessages(false);
      } else {
        const olderMessages = snapshot.docs.map(
          (doc) => doc.data() as IMessage
        );

        // Update the oldest message reference for next pagination
        if (olderMessages.length > 0) {
          setOldestMessageDoc(
            olderMessages[olderMessages.length - 1].createdAt
          );
        }

        // Add older messages at the beginning of the list
        setDisplayedMessages((prevMessages) => [
          ...olderMessages.reverse(),
          ...prevMessages,
        ]);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Calculate message list layout to maintain scroll position after loading more messages
  useEffect(() => {
    if (maintainPosition && displayedMessages.length > prevMessagesLength) {
      // Calculate the height of the new messages
      const newItemsCount = displayedMessages.length - prevMessagesLength;

      // Wait for layout to update with new messages
      setTimeout(() => {
        // Find the index of the first previously visible message
        const targetIndex = newItemsCount;

        // Scroll to that message to maintain relative position
        flatListRef.current?.scrollToIndex({
          index: targetIndex,
          animated: false,
          viewOffset: 0,
        });

        setMaintainPosition(false);
      }, 50);
    }
  }, [displayedMessages, maintainPosition, prevMessagesLength]);

  // Function to handle new messages from real-time listeners
  useEffect(() => {
    if (messages.length > 0 && displayedMessages.length > 0) {
      const lastDisplayedTimestamp = displayedMessages[
        displayedMessages.length - 1
      ].createdAt
        .toDate()
        .getTime();
      const newMessages = messages.filter(
        (msg) => msg.createdAt.toDate().getTime() > lastDisplayedTimestamp
      );

      if (newMessages.length > 0) {
        setDisplayedMessages((prevMessages) => [
          ...prevMessages,
          ...newMessages,
        ]);
      }
    }
  }, [messages]);

  const renderHeader = () => {
    if (isLoadingMore) {
      return (
        <View className="py-3 flex items-center justify-center">
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      );
    }

    if (!hasMoreMessages) {
      return (
        <View className="py-2 flex items-center justify-center">
          <Text className="text-gray-500 text-sm">No more messages</Text>
        </View>
      );
    }

    return (
      <View className="py-2 flex items-center justify-center">
        <Text className="text-gray-500 text-sm">Pull to load more</Text>
      </View>
    );
  };

  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    // Workaround for scroll to index failures
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    }, 100);
  };

  return (
    <FlatList
      ref={flatListRef}
      className="flex-1"
      data={displayedMessages}
      keyExtractor={(item, index) =>
        `${item.userId}-${item.createdAt?.toDate().getTime() || 0}-${index}`
      }
      contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 15 }}
      renderItem={({ item }) => (
        <MessageItem message={item} currentUser={currntUser} />
      )}
      ListHeaderComponent={renderHeader}
      onRefresh={() => loadMoreMessages()}
      refreshing={isLoadingMore}
      onScrollToIndexFailed={onScrollToIndexFailed}
      inverted={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 1,
        autoscrollToTopThreshold: 10,
      }}
      ListEmptyComponent={() => (
        <View className="flex-1 justify-center items-center mt-12">
          <Text style={{ color: "#999" }}>Say hello</Text>
        </View>
      )}
    />
  );
};

export default MessagesList;
