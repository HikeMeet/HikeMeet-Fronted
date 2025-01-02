

export const fetchPostsFromServer = async () => {
    const response = await fetch( `${process.env.EXPO_BASE_IP}/api/posts`);
    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    return await response.json();
  };
  