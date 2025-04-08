// src/api/postRequests.ts

const API_BASE_URL = `${process.env.EXPO_LOCAL_SERVER}/api/post`; // Replace with your actual API base URL

export const likePost = async (postId: string, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/${postId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error("Failed to like post");
  }
  return response.json();
};

export const unlikePost = async (postId: string, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/${postId}/like`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error("Failed to unlike post");
  }
  return response.json();
};

export const savePost = async (postId: string, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/${postId}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error("Failed to save post");
  }
  return response.json();
};

export const unsavePost = async (postId: string, userId: string) => {
  const response = await fetch(`${API_BASE_URL}/${postId}/save`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error("Failed to unsave post");
  }
  return response.json();
};
