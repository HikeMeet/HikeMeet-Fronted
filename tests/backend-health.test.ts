describe("Backend Health Check", () => {
  it('should respond with "Server is working"', async () => {
    const baseUrl: string = "http://172.20.10.3:3000";
    const response: Response = await fetch(`${baseUrl}/api`);
    const data: string = await response.text();

    expect(response.status).toBe(200);
    expect(data).toMatch(/Server is working/i);
  });
});
