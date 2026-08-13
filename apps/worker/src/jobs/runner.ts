import { createLogger } from "@myapp/shared";
import { prisma } from "../db.js";
import { handleExampleJob } from "./exampleJob.js";

const logger = createLogger("worker:runner");

export async function runNextJob(): Promise<boolean> {
  // Atomically claim one pending job
  const job = await prisma.$transaction(async (tx) => {
    const pending = await tx.job.findFirst({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    });

    if (!pending) return null;

    return tx.job.update({
      where: { id: pending.id },
      data: { status: "processing", updatedAt: new Date() },
    });
  });

  if (!job) return false;

  logger.info("Claimed job", { jobId: job.id, type: job.type });

  try {
    switch (job.type) {
      case "example":
        await handleExampleJob(job);
        break;
      default:
        logger.warn("Unknown job type, marking failed", { jobId: job.id, type: job.type });
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "failed", error: `Unknown job type: ${job.type}`, updatedAt: new Date() },
        });
        return true;
    }

    await prisma.job.update({
      where: { id: job.id },
      data: { status: "done", updatedAt: new Date() },
    });

    logger.info("Job completed", { jobId: job.id, type: job.type });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error("Job failed", { jobId: job.id, type: job.type, error });

    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", error, updatedAt: new Date() },
    });
  }

  return true;
}
