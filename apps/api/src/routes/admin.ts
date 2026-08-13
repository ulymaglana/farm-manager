import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../hooks/requireAuth.js";
import { requireRole } from "../hooks/requireRole.js";
import type { UserPublic, UserRole } from "@myapp/shared";

const adminOpts = {
  preHandler: [requireAuth, requireRole("ADMIN")],
} satisfies RouteShorthandOptions;

const AdminUsersQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/users — paginated list of all users (cursor-based)
  app.get("/users", adminOpts, async (request, reply) => {
    const queryResult = AdminUsersQuery.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({ error: "Invalid query parameters" });
    }
    const { cursor, limit } = queryResult.data;

    const users = await prisma.user.findMany({
      take: limit + 1, // fetch one extra to determine if there's a next page
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasNextPage = users.length > limit;
    const items = hasNextPage ? users.slice(0, limit) : users;
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    const publicUsers: UserPublic[] = items.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as UserRole,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return reply.send({ users: publicUsers, nextCursor });
  });
}
