import { IImageModel } from "./image-interface";

export interface IfromUser {
  _id: string;
  username: string;
  profile_picture: IImageModel;
}

export interface NotificationModel {
  /** Unique identifier */
  _id: string;
  /** Recipient user MongoDB ID */
  to: string;
  /** Optional sender user MongoDB ID */
  from?: IfromUser | string;
  /** Notification type (e.g. 'friend_request', 'trip_reminder', etc.) */
  type: string;
  /** Title displayed in the notification list */
  title: string;
  /** Main message body */
  body: string;
  /** Any additional data payload */
  data?: Record<string, any>;
  /** Read status (false = unread, true = read) */
  read: boolean;
  /** ISO timestamp string when created */
  created_on: string;
}
