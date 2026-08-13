import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { corsPlugin } from "./plugins/cors.js";
import { helmetPlugin } from "./plugins/helmet.js";
import { authPlugin } from "./plugins/jwt.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { adminRoutes } from "./routes/admin.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  // Global plugins (fp-wrapped, break encapsulation)
  app.register(corsPlugin);
  app.register(helmetPlugin);
  app.register(authPlugin); // registers @fastify/jwt + @fastify/cookie globally

  // Route plugins (encapsulated)
  app.register(healthRoutes);
  app.register(authRoutes, { prefix: "/auth" });
  app.register(adminRoutes, { prefix: "/admin" });

  return app;
}
