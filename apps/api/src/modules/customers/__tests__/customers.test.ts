import request from "supertest";
import { createTestApp } from "../../../test/app";
import { prisma } from "../../../lib/prisma";

const app = createTestApp();

describe("Customers + Tenant Isolation", () => {
  let cookieA: string[] = [];
  let cookieB: string[] = [];
  let customerIdA = "";

  const emailA = `owner-a-${Date.now()}@test.com`;
  const emailB = `owner-b-${Date.now()}@test.com`;

  beforeAll(async () => {
    const resA = await request(app).post("/api/auth/register").send({
      name: "Owner A",
      email: emailA,
      password: "password123",
      organizationName: "Salon A",
    });
    expect(resA.status).toBe(201);
    cookieA = resA.headers["set-cookie"];

    const resB = await request(app).post("/api/auth/register").send({
      name: "Owner B",
      email: emailB,
      password: "password123",
      organizationName: "Clinic B",
    });
    expect(resB.status).toBe(201);
    cookieB = resB.headers["set-cookie"];
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
  });

  it("Business A can create a customer", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set("Cookie", cookieA)
      .send({ name: "Customer of A", phone: "03001112233" });

    expect(res.status).toBe(201);
    expect(res.body.customer).toBeDefined();
    customerIdA = res.body.customer.id;
  });

  it("Business A can see its own customer", async () => {
    const res = await request(app)
      .get(`/api/customers/${customerIdA}`)
      .set("Cookie", cookieA);

    expect(res.status).toBe(200);
    expect(res.body.customer.id).toBe(customerIdA);
  });

  it("Business B cannot see Business A customer", async () => {
    const res = await request(app)
      .get(`/api/customers/${customerIdA}`)
      .set("Cookie", cookieB);

    expect(res.status).toBe(404);
  });

  it("Business B customer list excludes Business A customer", async () => {
    const res = await request(app)
      .get("/api/customers")
      .set("Cookie", cookieB);

    expect(res.status).toBe(200);
    const ids = res.body.data.map((customer: { id: string }) => customer.id);
    expect(ids).not.toContain(customerIdA);
  });
});
