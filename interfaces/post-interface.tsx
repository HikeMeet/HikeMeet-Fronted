import { Group } from "./group-interface";
import { IImageModel } from "./image-interface";
import { Trip } from "./trip-interface";

interface IUser {
  _id: string;
  username: string;
  profile_picture: { url: string; image_id: string };
}

interface IComment {
  _id: string;
  user: IUser | string;
  text: string;
  created_at: string;
  liked_by?: string[];
}

export interface IPost {
  _id: string;
  author: IUser | string;
  content?: string;
  images?: IImageModel[];
  attached_trip?: string | Trip;
  attached_group?: string | Group;
  likes: string[];
  shares: string[];
  saves: string[];
  comments: IComment[];
  is_shared: boolean;
  original_post?: string;
  type: "regular" | "group" | "share";
  created_at: string;
  updated_at: string;
}
