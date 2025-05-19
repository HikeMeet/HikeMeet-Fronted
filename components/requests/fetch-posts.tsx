const API_BASE_URL = `${process.env.EXPO_LOCAL_SERVER}/api/post`;

// postService.ts
export const fetchPostsForUser = async (
  profileOwner: { _id: string },
  viewerId?: string
): Promise<any[]> => {
  if (!profileOwner) return [];
  const url = `${API_BASE_URL}/all?userId=${profileOwner._id}`;

  try {
    const response = await fetch(url, {
      headers: viewerId ? { "x-current-user": viewerId } : undefined,
    });
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const fetchLikedSavedPostsForUser = async (
  userId: string,
  type: string
) => {
  const response = await fetch(`${API_BASE_URL}/${type}/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} posts`);
  }
  const data = await response.json();
  return data.posts;
};
