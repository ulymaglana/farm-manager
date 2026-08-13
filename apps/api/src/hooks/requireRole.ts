import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserRole } from "@myapp/shared";

export function requireRole(...roles: UserRole[]) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    if (!roles.includes(request.user.role)) {
      await reply.status(403).send({ error: "Forbidden" });
      return;
    }
  };
}
