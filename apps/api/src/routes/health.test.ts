import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";

vi.mock("../db.js");

import { buildApp } from "../app.js";
import { prisma } from "../db.js";

describe("GET /health", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns 200 {status:'ok', db:'connected'} when DB responds", async () => {
    prisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toStrictEqual({ status: "ok", db: "connected" });
  });

  it("returns 503 {status:'error', db:'disconnected'} when DB throws", async () => {
    prisma.$queryRaw.mockRejectedValue(new Error("connection refused"));

    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(503);
    expect(res.json()).toStrictEqual({ status: "error", db: "disconnected" });
  });
});
