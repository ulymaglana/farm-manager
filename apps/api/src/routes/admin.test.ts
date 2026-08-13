import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";

vi.mock("../db.js");
vi.mock("argon2");

import { buildApp } from "../app.js";
import { prisma } from "../db.js";

const MOCK_ADMIN = {
  id: "admin-cuid-1",
  email: "admin@example.com",
  name: "Admin",
  role: "ADMIN" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const MOCK_USER = {
  id: "user-cuid-1",
  email: "user@example.com",
  name: "User",
  role: "USER" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("Admin routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-jwt-signing";
    process.env.NODE_ENV = "test";
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("GET /admin/users", () => {
    it("returns 200 with user list for ADMIN", async () => {
      // requireRole re-fetches from DB
      prisma.user.findUnique.mockResolvedValue(MOCK_ADMIN);
      prisma.user.findMany.mockResolvedValue([MOCK_ADMIN, MOCK_USER]);

      const token = app.jwt.sign(
        { sub: MOCK_ADMIN.id, role: MOCK_ADMIN.role },
        { expiresIn: "15m" }
      );

      const res = await app.inject({
        method: "GET",
        url: "/admin/users",
        headers: { cookie: `token=${token}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json<{ users: typeof MOCK_USER[] }>();
      expect(Array.isArray(body.users)).toBe(true);
      // Should never include passwordHash
      for (const u of body.users) {
        expect(u).not.toHaveProperty("passwordHash");
      }
    });

    it("returns 403 for USER role", async () => {
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);

      const token = app.jwt.sign(
        { sub: MOCK_USER.id, role: MOCK_USER.role },
        { expiresIn: "15m" }
      );

      const res = await app.inject({
        method: "GET",
        url: "/admin/users",
        headers: { cookie: `token=${token}` },
      });

      expect(res.statusCode).toBe(403);
    });

    it("returns 401 without a token", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/admin/users",
      });
      expect(res.statusCode).toBe(401);
    });
  });
});
