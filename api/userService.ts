export const insertUserToBackend = async (userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => {
    try {
      const response = await fetch(`${process.env.EXPO_BASE_IP}/api/user/insert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to insert user to backend.");
      }
  
      console.log("User successfully inserted to backend.");
    } catch (error: any) {
      console.error("Backend registration error:", error.message);
      throw new Error(error.message || "Failed to insert user to backend.");
    }
  };
  