import type { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";

const createBodySchema = {
  type: "object",
  required: ["name", "species"],
  additionalProperties: false,
  properties: {
    name:        { type: "string", minLength: 1, maxLength: 100 },
    species:     { type: "string", minLength: 1, maxLength: 100 },
    age:         { type: "integer", minimum: 0, maximum: 200 },
    description: { type: "string", maxLength: 1000 },
  },
} as const;

const updateBodySchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    name:        { type: "string", minLength: 1, maxLength: 100 },
    species:     { type: "string", minLength: 1, maxLength: 100 },
    age:         { type: "integer", minimum: 0, maximum: 200 },
    description: { type: "string", maxLength: 1000 },
  },
} as const;

const idParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "^c[a-z0-9]{24}$" },
  },
} as const;

const listQuerySchema = {
  type: "object",
  properties: {
    limit:  { type: "integer", minimum: 1, maximum: 100, default: 20 },
    cursor: { type: "string" },
  },
} as const;

const notFound = { statusCode: 404, error: "Not Found", message: "Animal not found" };

export async function animalRoutes(app: FastifyInstance): Promise<void> {
  // GET / — cursor-paginated list
  app.get<{ Querystring: { limit?: number; cursor?: string } }>(
    "/",
    { schema: { querystring: listQuerySchema } },
    async (req, reply) => {
      const limit = req.query.limit ?? 20;
      const cursorId = req.query.cursor
        ? Buffer.from(req.query.cursor, "base64url").toString("utf8")
        : undefined;

      const animals = await prisma.animal.findMany({
        take: limit + 1,
        skip: cursorId ? 1 : 0,
        cursor: cursorId ? { id: cursorId } : undefined,
        orderBy: { createdAt: "desc" },
      });

      const hasNextPage = animals.length > limit;
      const data = hasNextPage ? animals.slice(0, limit) : animals;
      const last = data[data.length - 1];

      return reply.send({
        data,
        pagination: {
          hasNextPage,
          nextCursor: hasNextPage && last
            ? Buffer.from(last.id).toString("base64url")
            : null,
        },
      });
    }
  );

  // GET /:id
  app.get<{ Params: { id: string } }>(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (req, reply) => {
      const animal = await prisma.animal.findUnique({ where: { id: req.params.id } });
      if (!animal) return reply.status(404).send(notFound);
      return reply.send(animal);
    }
  );

  // POST /
  app.post<{ Body: { name: string; species: string; age?: number; description?: string } }>(
    "/",
    { schema: { body: createBodySchema } },
    async (req, reply) => {
      const animal = await prisma.animal.create({ data: req.body });
      return reply.status(201).send(animal);
    }
  );

  // PUT /:id — partial update
  app.put<{
    Params: { id: string };
    Body: { name?: string; species?: string; age?: number; description?: string };
  }>(
    "/:id",
    { schema: { params: idParamsSchema, body: updateBodySchema } },
    async (req, reply) => {
      try {
        const animal = await prisma.animal.update({
          where: { id: req.params.id },
          data: req.body,
        });
        return reply.send(animal);
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
          return reply.status(404).send(notFound);
        }
        throw err;
      }
    }
  );

  // DELETE /:id
  app.delete<{ Params: { id: string } }>(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (req, reply) => {
      try {
        await prisma.animal.delete({ where: { id: req.params.id } });
        return reply.status(204).send();
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
          return reply.status(404).send(notFound);
        }
        throw err;
      }
    }
  );
}
