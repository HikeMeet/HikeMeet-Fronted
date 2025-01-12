export interface MongoUser {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string | null;
  profile_picture: string;
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
  friends: string[];
  __v: number;
}
