const API_BASE_URL = `${process.env.EXPO_LOCAL_SERVER}/api/post`;

// postService.ts
export const fetchPostsForUser = async (userId: {
  _id: string;
}): Promise<any[]> => {
  if (!userId) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/all?userId=${userId._id}`);
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const fetchLikedPostsForUser = async (userId: string, type: string) => {
  const response = await fetch(`${API_BASE_URL}/${type}/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} posts`);
  }
  const data = await response.json();
  return data.posts;
};
