import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";

// vi.mock must be the first executable statement (Vitest hoisting requirement)
vi.mock("../db.js");

import { buildApp } from "../app.js";
import { prisma } from "../db.js";

// CUID v1 format: c + 24 lowercase alphanumeric = 25 chars total
const VALID_ID = "cjld2cjxh0000qzrmn831i7rn";

const mockAnimal = {
  id: VALID_ID,
  name: "Leo",
  species: "Lion",
  age: 5,
  description: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const p2025 = new Prisma.PrismaClientKnownRequestError("Record not found", {
  code: "P2025",
  clientVersion: "5.0.0",
});

describe("Animal routes", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("GET /animals", () => {
    it("returns 200 with paginated data and pagination metadata", async () => {
      prisma.animal.findMany.mockResolvedValue([mockAnimal]);

      const res = await app.inject({ method: "GET", url: "/animals" });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty("data");
      expect(body.data).toHaveLength(1);
      expect(body.pagination).toStrictEqual({ hasNextPage: false, nextCursor: null });
    });

    it("returns 200 with empty data array when no animals exist", async () => {
      prisma.animal.findMany.mockResolvedValue([]);

      const res = await app.inject({ method: "GET", url: "/animals" });

      expect(res.statusCode).toBe(200);
      expect(res.json().data).toStrictEqual([]);
    });
  });

  describe("GET /animals/:id", () => {
    it("returns 200 with the animal when found", async () => {
      prisma.animal.findUnique.mockResolvedValue(mockAnimal);

      const res = await app.inject({ method: "GET", url: `/animals/${VALID_ID}` });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toStrictEqual(expect.objectContaining({ name: "Leo", species: "Lion" }));
    });

    it("returns 404 when animal not found", async () => {
      prisma.animal.findUnique.mockResolvedValue(null);

      const res = await app.inject({ method: "GET", url: `/animals/${VALID_ID}` });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toStrictEqual(expect.objectContaining({ error: "Not Found" }));
    });

    it("returns 400 for invalid CUID format", async () => {
      const res = await app.inject({ method: "GET", url: "/animals/not-a-valid-id" });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /animals", () => {
    it("returns 201 with the created animal", async () => {
      prisma.animal.create.mockResolvedValue(mockAnimal);

      const res = await app.inject({
        method: "POST",
        url: "/animals",
        payload: { name: "Leo", species: "Lion" },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json()).toStrictEqual(expect.objectContaining({ name: "Leo" }));
    });

    it("returns 400 when required field 'name' is missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/animals",
        payload: { species: "Lion" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("returns 400 when required field 'species' is missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/animals",
        payload: { name: "Leo" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("strips unknown fields and creates successfully (Fastify default: removeAdditional)", async () => {
      // Fastify's default AJV config uses removeAdditional:true — extra fields are
      // stripped before the handler runs, not rejected with 400.
      prisma.animal.create.mockResolvedValue(mockAnimal);
      const res = await app.inject({
        method: "POST",
        url: "/animals",
        payload: { name: "Leo", species: "Lion", hack: "injected" },
      });

      expect(res.statusCode).toBe(201);
    });
  });

  describe("PUT /animals/:id", () => {
    it("returns 200 with the updated animal", async () => {
      prisma.animal.update.mockResolvedValue({ ...mockAnimal, name: "Simba" });

      const res = await app.inject({
        method: "PUT",
        url: `/animals/${VALID_ID}`,
        payload: { name: "Simba" },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toStrictEqual(expect.objectContaining({ name: "Simba" }));
    });

    it("returns 404 when animal not found", async () => {
      prisma.animal.update.mockRejectedValue(p2025);

      const res = await app.inject({
        method: "PUT",
        url: `/animals/${VALID_ID}`,
        payload: { name: "Simba" },
      });

      expect(res.statusCode).toBe(404);
    });

    it("returns 400 when body has wrong field types", async () => {
      const res = await app.inject({
        method: "PUT",
        url: `/animals/${VALID_ID}`,
        payload: { age: "not-a-number" },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("DELETE /animals/:id", () => {
    it("returns 204 on successful deletion", async () => {
      prisma.animal.delete.mockResolvedValue(mockAnimal);

      const res = await app.inject({ method: "DELETE", url: `/animals/${VALID_ID}` });

      expect(res.statusCode).toBe(204);
    });

    it("returns 404 when animal not found", async () => {
      prisma.animal.delete.mockRejectedValue(p2025);

      const res = await app.inject({ method: "DELETE", url: `/animals/${VALID_ID}` });

      expect(res.statusCode).toBe(404);
    });
  });
});
