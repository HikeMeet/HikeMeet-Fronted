// postService.ts
export const fetchPostsForUser = async (userId: {
  _id: string;
}): Promise<any[]> => {
  if (!userId) return [];
  try {
    const response = await fetch(
      `${process.env.EXPO_LOCAL_SERVER}/api/post/all?userId=${userId._id}`
    );
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};
