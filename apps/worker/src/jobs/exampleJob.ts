import type { Job } from "@prisma/client";
import { createLogger } from "@myapp/shared";

const logger = createLogger("worker:exampleJob");

export async function handleExampleJob(job: Job): Promise<void> {
  logger.info("Processing example job", { jobId: job.id, payload: job.payload });

  // Simulate some async work
  await new Promise((resolve) => setTimeout(resolve, 500));

  logger.info("Example job completed", { jobId: job.id });
}
