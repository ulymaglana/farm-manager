import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserRole } from "@myapp/shared";
import { prisma } from "../db.js";

export function requireRole(...roles: UserRole[]) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { role: true },
    });
    if (!user || !roles.includes(user.role as UserRole)) {
      await reply.status(403).send({ error: "Forbidden" });
    }
  };
}
