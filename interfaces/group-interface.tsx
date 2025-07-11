import { IImageModel } from "./image-interface";

export interface GroupMember {
  user: string;
  role: "admin" | "companion";
  joined_at: string; // ISO date string
}

export interface GroupPending {
  user: string;
  origin: "invite" | "request";
  status: "pending" | "accepted" | "declined";
  created_at: string; // ISO date string
}

export interface IGroup {
  _id: string;
  name: string;
  members: GroupMember[];
  main_image?: IImageModel;
}
export interface Group {
  _id: string;
  name: string;
  trip: string;
  max_members: number;
  privacy: "public" | "private";
  difficulty?: string;
  description?: string;
  status: "planned" | "active" | "completed";
  created_by: string;
  members: GroupMember[];
  pending: GroupPending[];
  scheduled_start?: string; // ISO date string (or convert to Date)
  scheduled_end?: string; // ISO date string (or convert to Date)
  meeting_point?: {
    address: string;
    coordinates: [number, number];
  };
  embarked_at?: string; // HH:mm format if applicable
  images?: IImageModel[];
  main_image?: IImageModel;
  chat_room_id?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
