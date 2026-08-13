import Fastify from "fastify";
import type { FastifyInstance, FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health.js";
import { animalRoutes } from "./routes/animals.js";

export function buildApp(opts: Partial<FastifyServerOptions> = {}): FastifyInstance {
  const app = Fastify({ logger: true, ...opts });
  app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  });
  app.register(healthRoutes);
  app.register(animalRoutes, { prefix: "/animals" });
  return app;
}
