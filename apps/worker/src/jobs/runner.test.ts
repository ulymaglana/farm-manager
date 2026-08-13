import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Prisma, Job } from "@prisma/client";

vi.mock("../db.js");
vi.mock("@myapp/shared", () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));
vi.mock("./exampleJob.js", () => ({
  handleExampleJob: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from "../db.js";
import { runNextJob } from "./runner.js";

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: "job-1",
  type: "example",
  status: "pending",
  payload: {},
  error: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("runNextJob", () => {
  beforeEach(() => {
    // Passthrough transaction: invoke the callback with the mock client.
    // The cast is necessary because DeepMockProxy<PrismaClient> is structurally
    // compatible with Prisma.TransactionClient but not nominally assignable.
    prisma.$transaction.mockImplementation(
      (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
        callback(prisma as unknown as Prisma.TransactionClient)
    );
  });

  it("returns false when no pending jobs exist", async () => {
    prisma.job.findFirst.mockResolvedValue(null);

    const result = await runNextJob();

    expect(result).toBe(false);
    expect(prisma.job.update).not.toHaveBeenCalled();
  });

  it("claims job, dispatches example handler, marks done", async () => {
    const job = makeJob();
    prisma.job.findFirst.mockResolvedValue(job);
    prisma.job.update.mockResolvedValue({ ...job, status: "done" });

    const result = await runNextJob();

    expect(result).toBe(true);
    expect(prisma.job.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "done" }),
      })
    );
  });

  it("marks failed with 'Unknown job type' for unrecognized type", async () => {
    const job = makeJob({ type: "unrecognized" });
    prisma.job.findFirst.mockResolvedValue(job);
    prisma.job.update.mockResolvedValue({ ...job, status: "failed" });

    const result = await runNextJob();

    expect(result).toBe(true);
    expect(prisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "failed",
          error: expect.stringContaining("Unknown job type"),
        }),
      })
    );
  });

  it("catches handler errors and marks job failed", async () => {
    const { handleExampleJob } = await import("./exampleJob.js");
    vi.mocked(handleExampleJob).mockRejectedValueOnce(
      new Error("handler error")
    );

    const job = makeJob();
    prisma.job.findFirst.mockResolvedValue(job);
    prisma.job.update.mockResolvedValue({ ...job, status: "processing" });

    const result = await runNextJob();

    expect(result).toBe(true);
    expect(prisma.job.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "failed",
          error: "handler error",
        }),
      })
    );
  });
});
