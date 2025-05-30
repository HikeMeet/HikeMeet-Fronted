import { Group } from "./group-interface";
import { IImageModel } from "./image-interface";
import { Trip } from "./trip-interface";
export const getPostWithParam = (post: IPost) =>
  typeof post.author === "object"
    ? post.author
    : { username: post.author, profile_picture: { url: "" }, _id: "" };

export interface IUser {
  _id: string;
  username: string;
  profile_picture: { url: string; image_id: string };
  first_name?: string;
  last_name?: string;
  firebase_id?: string;
  mutedChats?: string[];
}

export interface IComment {
  _id: string;
  user: IUser | string;
  text: string;
  created_at: string;
  liked_by?: IUser[] | string[];
}

export interface IPost {
  _id: string;
  author: IUser | string;
  in_group?: string | Group;
  content?: string;
  images?: IImageModel[];
  attached_trips?: string[] | Trip[];
  attached_groups?: string[] | Group[];
  likes: IUser[] | string[];
  shares: string[];
  saves: string[];
  comments: IComment[];
  is_shared: boolean;
  privacy: "public" | "private";
  original_post?: string | IPost;
  type: "regular" | "share_trip" | "share_group";
  created_at: string;
  updated_at: string;
}
