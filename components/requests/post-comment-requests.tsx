// commentsRequests.ts
const API_BASE_URL = process.env.EXPO_LOCAL_SERVER; // Ensure this is set correctly

// Create a new comment on a post
export const createComment = async (
  postId: string,
  userId: string,
  text: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/post/${postId}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, text }),
  });
  if (!response.ok) {
    throw new Error("Failed to create comment");
  }
  const data = await response.json();
  return data.comment; // returns the newly created comment
};

// Update an existing comment on a post
export const updateComment = async (
  postId: string,
  commentId: string,
  userId: string,
  text: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/post/${postId}/comment/${commentId}`,
    {
      method: "POST", // our update endpoint is implemented as POST
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, text }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update comment");
  }
  const data = await response.json();
  return data.comment;
};

// Delete a comment from a post
export const deleteComment = async (
  postId: string,
  commentId: string,
  userId: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/post/${postId}/comment/${commentId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }
  const data = await response.json();
  return data.message; // message: "Comment deleted successfully"
};

// Like a comment on a post
export const likeComment = async (
  postId: string,
  commentId: string,
  userId: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/post/${postId}/comment/${commentId}/like`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to like comment");
  }
  const data = await response.json();
  return data.comment; // returns the updated comment with the new like
};

// Unlike a comment on a post
export const unlikeComment = async (
  postId: string,
  commentId: string,
  userId: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/post/${postId}/comment/${commentId}/like`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to unlike comment");
  }
  const data = await response.json();
  return data.comment; // returns the updated comment after removing the like
};
