import { pathToFileURL } from "node:url";
import { createLogger } from "@myapp/shared";
import { prisma } from "./db.js";
import { runNextJob } from "./jobs/runner.js";

const logger = createLogger("worker");
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 5000);

export async function pollLoop(signal?: AbortSignal): Promise<void> {
  logger.info("Worker started", { pollIntervalMs: POLL_INTERVAL_MS });

  while (!signal?.aborted) {
    try {
      const processed = await runNextJob();
      if (!processed) {
        await sleep(POLL_INTERVAL_MS);
      }
    } catch (err) {
      logger.error("Poll loop error", { error: String(err) });
      await sleep(POLL_INTERVAL_MS);
    }
  }

  logger.info("Worker stopped");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const controller = new AbortController();

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  controller.abort();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  pollLoop(controller.signal).catch((err) => {
    logger.error("Fatal error in poll loop", { error: String(err) });
    process.exit(1);
  });
}
