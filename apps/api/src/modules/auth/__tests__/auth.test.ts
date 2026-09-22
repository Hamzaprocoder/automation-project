import request from "supertest";
import { createTestApp } from "../../../test/app";
import { prisma } from "../../../lib/prisma";

const app = createTestApp();

describe("Auth", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const password = "password123";

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  it("registers a new user and organization", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Owner",
      email: testEmail,
      password,
      organizationName: "Test Salon",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.organization).toBeDefined();
    expect(res.body.role).toBe("OWNER");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});
