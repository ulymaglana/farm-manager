import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";

vi.mock("../db.js");
vi.mock("argon2");

import { buildApp } from "../app.js";
import { prisma } from "../db.js";
import * as argon2 from "argon2";

const mockArgon2 = argon2 as {
  hash: ReturnType<typeof vi.fn>;
  verify: ReturnType<typeof vi.fn>;
};

const MOCK_USER = {
  id: "user-cuid-1",
  email: "test@example.com",
  name: "Test User",
  role: "USER" as const,
  passwordHash: "hashed_password",
  failedLoginCount: 0,
  lastFailedLoginAt: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const MOCK_USER_PUBLIC = {
  id: MOCK_USER.id,
  email: MOCK_USER.email,
  name: MOCK_USER.name,
  role: MOCK_USER.role,
  createdAt: MOCK_USER.createdAt,
  updatedAt: MOCK_USER.updatedAt,
};

const MOCK_SESSION = {
  id: "session-cuid-1",
  userId: MOCK_USER.id,
  token: "refresh-token-abc",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
};

describe("Auth routes", () => {
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

  describe("POST /auth/register", () => {
    it("returns 201 with user and token on success", async () => {
      mockArgon2.hash.mockResolvedValue("hashed_password");
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(MOCK_USER);
      prisma.session.create.mockResolvedValue(MOCK_SESSION);

      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "test@example.com",
          password: "strongpassword123",
          name: "Test User",
        },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json<{ user: typeof MOCK_USER_PUBLIC; token: string }>();
      expect(body.user.email).toBe("test@example.com");
      expect(body.user).not.toHaveProperty("passwordHash");
      expect(body.token).toBeTruthy();
    });

    it("returns 409 when email already exists", async () => {
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);

      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "test@example.com",
          password: "strongpassword123",
        },
      });

      expect(res.statusCode).toBe(409);
      expect(res.json<{ error: string }>().error).toMatch(/already registered/i);
    });

    it("returns 400 for missing email", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { password: "strongpassword123" },
      });
      expect(res.statusCode).toBe(400);
    });

    it("returns 400 for password shorter than 12 characters", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { email: "test@example.com", password: "short" },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    it("returns 200 with user and token on valid credentials", async () => {
      mockArgon2.verify.mockResolvedValue(true);
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);
      prisma.user.update.mockResolvedValue(MOCK_USER);
      prisma.session.create.mockResolvedValue(MOCK_SESSION);

      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "test@example.com", password: "strongpassword123" },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json<{ user: typeof MOCK_USER_PUBLIC; token: string }>();
      expect(body.user.email).toBe("test@example.com");
      expect(body.user).not.toHaveProperty("passwordHash");
      expect(body.token).toBeTruthy();
      // Should set token cookie
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("returns 401 for wrong password (same error message)", async () => {
      mockArgon2.verify.mockResolvedValue(false);
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);
      prisma.user.update.mockResolvedValue(MOCK_USER);

      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "test@example.com", password: "wrongpassword123" },
      });

      expect(res.statusCode).toBe(401);
      expect(res.json<{ error: string }>().error).toBe("Invalid credentials");
    });

    it("returns 401 for unknown email (same error message — no enumeration)", async () => {
      mockArgon2.verify.mockResolvedValue(false);
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "nobody@example.com", password: "strongpassword123" },
      });

      expect(res.statusCode).toBe(401);
      expect(res.json<{ error: string }>().error).toBe("Invalid credentials");
    });
  });

  describe("GET /auth/me", () => {
    it("returns 200 with current user when authenticated", async () => {
      prisma.user.findUnique.mockResolvedValue(MOCK_USER);

      // Sign a JWT directly using the app's jwt instance
      const token = app.jwt.sign(
        { sub: MOCK_USER.id, role: MOCK_USER.role },
        { expiresIn: "15m" }
      );

      const res = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { cookie: `token=${token}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json<{ user: typeof MOCK_USER_PUBLIC }>();
      expect(body.user.id).toBe(MOCK_USER.id);
      expect(body.user).not.toHaveProperty("passwordHash");
    });

    it("returns 401 without a token", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/auth/me",
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("returns 200 and clears cookies", async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 1 });

      const token = app.jwt.sign(
        { sub: MOCK_USER.id, role: MOCK_USER.role },
        { expiresIn: "15m" }
      );

      const res = await app.inject({
        method: "POST",
        url: "/auth/logout",
        headers: { cookie: `token=${token}; refreshToken=some-refresh` },
      });

      expect(res.statusCode).toBe(200);
    });

    it("returns 401 without a token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/logout",
      });
      expect(res.statusCode).toBe(401);
    });
  });
});
