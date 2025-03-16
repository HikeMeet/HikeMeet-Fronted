export interface Friend {
  id: string;
  status: string;
}
export interface IProfilePicture {
  url: string;
  image_id: string;
}

export interface MongoUser {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string | null;
  profile_picture: IProfilePicture;
  bio: string;
  facebook_link: string;
  instagram_link: string;
  role: string;
  social: {
    posts_saved: string[];
    posts_liked: string[];
  };
  firebase_id: string;
  created_on: string;
  updated_on: string;
  _id: string;
  friends: Friend[]; // Now each friend has an id and a status.
  __v: number;
}
