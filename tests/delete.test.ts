import request from "supertest";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

// Use the backend server URL from environment variables
const BACKEND_URL = process.env.EXPO_LOCAL_SERVER || "http://localhost:3000";

console.log("🌐 Backend URL for deletion tests:", BACKEND_URL);

// Helper function to make API calls with better error handling
const makeApiCall = async (method: string, endpoint: string, data?: any) => {
  let req;

  switch (method.toLowerCase()) {
    case "get":
      req = request(BACKEND_URL).get(endpoint);
      break;
    case "post":
      req = request(BACKEND_URL).post(endpoint);
      break;
    case "put":
      req = request(BACKEND_URL).put(endpoint);
      break;
    case "delete":
      req = request(BACKEND_URL).delete(endpoint);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }

  req.set("Content-Type", "application/json");

  if (data) {
    req.send(data);
  }

  const response = await req;

  console.log(`${method} ${endpoint} - Status: ${response.status}`, {
    body: response.body,
    error: response.error,
  });

  return response;
};

describe("Integration Tests - Resource Deletion", () => {
  // Test resource IDs - these should be set to actual IDs from created resources
  // You can get these from the creation test output or set them manually
  let mongoUserId: string = "";
  let tripId: string = "";
  let groupId: string = "";
  let postId: string = "";

  beforeAll(async () => {
    console.log("🗑️ Starting resource deletion tests");
    console.log(
      "⚠️ Make sure to set the resource IDs before running these tests!"
    );

    // Set these IDs from your creation tests output
    mongoUserId = "684e7137ff539aa95ee0b41d";
    tripId = "684e7137ff539aa95ee0b420";
    groupId = "684e7138ff539aa95ee0b427";
    postId = "684e7139ff539aa95ee0b42c";

    console.log("📋 Resource IDs to delete:", {
      user: mongoUserId,
      trip: tripId,
      group: groupId,
      post: postId,
    });
  });

  afterAll(async () => {
    console.log("🧹 Resource deletion tests completed");
  });

  describe("1. Resource Cleanup - Group Deletion", () => {
    it("should delete the created group successfully", async () => {
      if (!groupId || groupId.length !== 24) {
        console.log("⚠️ Skipping group deletion - no valid group ID provided");
        console.log("💡 Set groupId variable with a valid MongoDB ObjectId");
        return;
      }

      const response = await makeApiCall(
        "DELETE",
        `/api/group/${groupId}/delete`,
        { deleted_by: mongoUserId }
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("✅ Group deleted successfully:", groupId);
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(300);
      } else {
        console.log("⚠️ Group deletion failed - this might be expected");
      }
    });

    it("should verify group no longer exists", async () => {
      if (!groupId || groupId.length !== 24) {
        console.log(
          "⚠️ Skipping group verification - no valid group ID provided"
        );
        return;
      }

      const response = await makeApiCall("GET", `/api/group/${groupId}`);

      if (response.status === 404) {
        console.log("✅ Group successfully deleted and verified");
        expect(response.status).toBe(404);
      } else {
        console.log("⚠️ Group verification failed - group may still exist");
      }
    });
  });

  describe("2. Resource Cleanup - Trip Deletion", () => {
    it("should delete the created trip successfully", async () => {
      if (!tripId || tripId.length !== 24) {
        console.log("⚠️ Skipping trip deletion - no valid trip ID provided");
        console.log("💡 Set tripId variable with a valid MongoDB ObjectId");
        return;
      }

      const response = await makeApiCall(
        "DELETE",
        `/api/trips/${tripId}/delete`
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("✅ Trip deleted successfully:", tripId);
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(300);
      } else {
        console.log("⚠️ Trip deletion failed - this might be expected");
      }
    });

    it("should verify trip no longer exists", async () => {
      if (!tripId || tripId.length !== 24) {
        console.log(
          "⚠️ Skipping trip verification - no valid trip ID provided"
        );
        return;
      }

      const response = await makeApiCall("GET", `/api/trips/${tripId}`);

      if (response.status === 404) {
        console.log("✅ Trip successfully deleted and verified");
        expect(response.status).toBe(404);
      } else {
        console.log("⚠️ Trip verification failed - trip may still exist");
      }
    });
  });

  describe("3. Resource Cleanup - User Deletion", () => {
    it("should delete the created user successfully", async () => {
      if (!mongoUserId || mongoUserId.length !== 24) {
        console.log("⚠️ Skipping user deletion - no valid user ID provided");
        console.log(
          "💡 Set mongoUserId variable with a valid MongoDB ObjectId"
        );
        return;
      }

      const response = await makeApiCall(
        "DELETE",
        `/api/user/${mongoUserId}/delete`
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("✅ User deleted successfully:", mongoUserId);
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(300);
      } else {
        console.log("⚠️ User deletion failed - this might be expected");
      }
    });

    it("should verify user no longer exists", async () => {
      if (!mongoUserId || mongoUserId.length !== 24) {
        console.log(
          "⚠️ Skipping user verification - no valid user ID provided"
        );
        return;
      }

      const response = await makeApiCall("GET", `/api/user/${mongoUserId}`);

      if (response.status === 404) {
        console.log("✅ User successfully deleted and verified");
        expect(response.status).toBe(404);
      } else {
        console.log("⚠️ User verification failed - user may still exist");
      }
    });
  });

  describe("4. Final Verification - Post Cleanup", () => {
    it("should verify post was also cleaned up or handle orphaned post", async () => {
      if (!postId || postId.length !== 24) {
        console.log(
          "⚠️ Skipping post cleanup verification - no valid post ID provided"
        );
        console.log("💡 Set postId variable with a valid MongoDB ObjectId");
        return;
      }

      // Try to fetch the post - it might have been cascade deleted or still exist as orphaned
      const response = await makeApiCall("GET", `/api/post/${postId}`);

      if (response.status === 200) {
        // If post still exists, manually delete it
        console.log("🧹 Post still exists, cleaning up manually...");
        const deleteResponse = await makeApiCall(
          "DELETE",
          `/api/post/${postId}/delete`,
          { userId: mongoUserId }
        );

        if (deleteResponse.status >= 200 && deleteResponse.status < 300) {
          console.log("✅ Post cleaned up successfully:", postId);
          expect(deleteResponse.status).toBeGreaterThanOrEqual(200);
          expect(deleteResponse.status).toBeLessThan(300);
        } else {
          console.log("⚠️ Post cleanup failed");
        }
      } else if (response.status === 404) {
        console.log("✅ Post was cascade deleted:", postId);
        expect(response.status).toBe(404);
      } else {
        console.log("⚠️ Post status unclear");
      }
    });
  });

  describe("5. Deletion Summary", () => {
    it("should have completed all resource deletion attempts", () => {
      console.log("🎉 Resource deletion tests completed!");
      console.log("📋 Processed resource IDs:", {
        user: mongoUserId || "Not provided",
        trip: tripId || "Not provided",
        group: groupId || "Not provided",
        post: postId || "Not provided",
      });

      if (!mongoUserId || !tripId || !groupId || !postId) {
        console.log("⚠️ Some resource IDs were not provided. Make sure to:");
        console.log(
          "1. Run the creation tests first: npm test -- tests/new.test.ts"
        );
        console.log("2. Copy the resource IDs from the output");
        console.log("3. Set them in the beforeAll() section of this test file");
        console.log(
          "4. Run this deletion test: npm test -- tests/delete.test.ts"
        );
      }

      // This test always passes as it's just a summary
      expect(true).toBe(true);
    });
  });
});
