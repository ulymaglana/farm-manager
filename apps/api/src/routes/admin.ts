import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { prisma } from "../db.js";
import { requireAuth } from "../hooks/requireAuth.js";
import { requireRole } from "../hooks/requireRole.js";
import type { UserPublic, UserRole } from "@myapp/shared";

const adminOpts = {
  preHandler: [requireAuth, requireRole("ADMIN")],
} satisfies RouteShorthandOptions;

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/users — paginated list of all users (cursor-based)
  app.get("/users", adminOpts, async (request, reply) => {
    const query = request.query as { cursor?: string; limit?: string };
    const limit = Math.min(Number(query.limit ?? 20), 100);
    const cursor = query.cursor;

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
