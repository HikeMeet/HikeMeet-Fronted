describe("Backend Health Check", () => {
  it("should respond with 'Server is working'", async () => {
    const baseUrl = process.env.EXPO_LOCAL_SERVER || "http://localhost:3000";
    console.log("baseUrl", baseUrl);
    const response = await fetch(`${baseUrl}/api`);
    const data = await response.text();

    expect(response.status).toBe(200);
    expect(data).toMatch(/Server is working/i);
  });
});
