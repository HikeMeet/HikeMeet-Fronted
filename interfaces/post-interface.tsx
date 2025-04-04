import { Group } from "./group-interface";
import { IImageModel } from "./image-interface";
import { Trip } from "./trip-interface";
/*************  ✨ Codeium Command 🌟  *************/
export const getPostWithParam = (post: IPost) =>
  typeof post.author === "object"
    ? post.author
    : { username: post.author, profile_picture: { url: "" }, _id: "" };

interface IUser {
  /******  c804094c-1c66-45c2-9320-8f7c45d09052  *******/
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
  in_group?: string | Group;
  content?: string;
  images?: IImageModel[];
  attached_trip?: string | Trip;
  attached_group?: string | Group;
  likes: string[];
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
