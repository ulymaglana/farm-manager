import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./routes/health.js";
import { animalRoutes } from "./routes/animals.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });
  app.register(healthRoutes);
  app.register(animalRoutes, { prefix: "/animals" });
  return app;
}
