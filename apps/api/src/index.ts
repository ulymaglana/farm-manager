import { pathToFileURL } from "node:url";
import { createLogger } from "@myapp/shared";
import { buildApp } from "./app.js";
import { prisma } from "./db.js";

const logger = createLogger("api");
const port = Number(process.env.PORT ?? 3001);

const start = async () => {
  const app = buildApp();
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
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start();
}
