import { describe, it, expect, vi } from "vitest";
import type { DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient, Job } from "@prisma/client";

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

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

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
  it("returns false when no pending jobs exist", async () => {
    prismaMock.$transaction.mockImplementation((callback: (tx: any) => any) =>
      callback(prismaMock)
    );
    prismaMock.job.findFirst.mockResolvedValue(null);

    const result = await runNextJob();

    expect(result).toBe(false);
    expect(prismaMock.job.update).not.toHaveBeenCalled();
  });

  it("claims job, dispatches example handler, marks done", async () => {
    const job = makeJob();
    prismaMock.$transaction.mockImplementation((callback: (tx: any) => any) =>
      callback(prismaMock)
    );
    prismaMock.job.findFirst.mockResolvedValue(job);
    prismaMock.job.update.mockResolvedValue({ ...job, status: "done" });

    const result = await runNextJob();

    expect(result).toBe(true);
    expect(prismaMock.job.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "done" }),
      })
    );
  });

  it("marks failed with 'Unknown job type' for unrecognized type", async () => {
    const job = makeJob({ type: "unrecognized" });
    prismaMock.$transaction.mockImplementation((callback: (tx: any) => any) =>
      callback(prismaMock)
    );
    prismaMock.job.findFirst.mockResolvedValue(job);
    prismaMock.job.update.mockResolvedValue({ ...job, status: "failed" });

    const result = await runNextJob();

    expect(result).toBe(true);
    expect(prismaMock.job.update).toHaveBeenCalledWith(
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
    prismaMock.$transaction.mockImplementation((callback: (tx: any) => any) =>
      callback(prismaMock)
    );
    prismaMock.job.findFirst.mockResolvedValue(job);
    prismaMock.job.update.mockResolvedValue({ ...job, status: "processing" });

    const result = await runNextJob();

    expect(result).toBe(true);
    expect(prismaMock.job.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "failed",
          error: "handler error",
        }),
      })
    );
  });
});
