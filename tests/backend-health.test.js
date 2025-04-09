import axios from "axios";

describe("Backend Health Check", () => {
  it("should respond with 'Server is working'", async () => {
    const response = await axios.get("http://backend:3000/api");
    expect(response.status).toBe(200);
    expect(response.data).toMatch(/Server is working/i);
  });
});
