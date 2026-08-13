import Fastify from "fastify";
import { createLogger } from "@myapp/shared";
import { healthRoutes } from "./routes/health.js";

const logger = createLogger("api");
const port = Number(process.env.PORT ?? 3001);

const app = Fastify({ logger: false });

app.register(healthRoutes);

const start = async () => {
  try {
    await app.listen({ port, host: "0.0.0.0" });
    logger.info(`API server started`, { port });
  } catch (err) {
    logger.error("Failed to start server", { error: String(err) });
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down`);
  await app.close();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();
