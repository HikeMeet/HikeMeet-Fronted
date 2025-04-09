import axios from "axios";
describe("Backend Health Check", () => {
  it("should respond with 'Server is working'", async () => {
    const baseUrl = process.env.EXPO_LOCAL_SERVER || "http://backend:3000";
    const response = await axios.get(`${baseUrl}/api`);
    expect(response.status).toBe(200);
    expect(response.data).toMatch(/Server is working/i);
  });
});
