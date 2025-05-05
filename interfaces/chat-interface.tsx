import { Timestamp } from "firebase/firestore";

export interface IMessage {
  /** Firestore document ID */
  id: string;
  /** UID of the sender (matches auth.currentUser.uid) */
  userId: string;
  /** Human-readable name of the sender */
  senderName: string;
  /** Message text */
  text: string;
  /** Firestore timestamp when the message was created */
  createdAt: Timestamp;
}

export interface IChatRoom {
  id: string;
  createdAt: Timestamp;
}
