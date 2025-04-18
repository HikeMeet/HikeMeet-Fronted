export const deleteMongoUser = async (mongoId: string): Promise<any> => {
  try {
    if (!mongoId) {
      throw new Error(`User ID ${mongoId} is not available.`);
    }

    const response = await fetch(
      `${process.env.EXPO_LOCAL_SERVER}/api/user/${mongoId}/delete`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to delete user:", errorData);
      throw new Error(errorData.error || "Failed to delete user");
    }

    const result = await response.json();
    console.log("User deleted successfully:", result);
    return result;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const blockUser = async (
  currentUserId: string,
  targetUserId: string
) => {
  const response = await fetch(
    `${process.env.EXPO_LOCAL_SERVER}/api/friend/block`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentUserId,
        targetUserId,
      }),
    }
  );
  const data = await response.json();
  return data;
};

export const revokeFriendRequest = async (
  currentUserId: string,
  targetUserId: string
) => {
  const response = await fetch(
    `${process.env.EXPO_LOCAL_SERVER}/api/friend/revoke-request`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentUserId,
        targetUserId,
      }),
    }
  );
  const data = await response.json();
  return data;
};
