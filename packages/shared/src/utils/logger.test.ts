import { describe, it, expect, vi } from "vitest";
import { createLogger } from "./logger.js";

describe("createLogger", () => {
  it("routes info and debug to process.stdout", () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);

    const logger = createLogger("test-ctx");
    logger.info("hello");
    logger.debug("world");

    expect(stdoutSpy).toHaveBeenCalledTimes(2);
    const parsed = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(parsed).toMatchObject({
      level: "info",
      message: "hello",
      context: "test-ctx",
    });
    expect(typeof parsed.timestamp).toBe("string");
  });

  it("routes warn and error to process.stderr", () => {
    const stderrSpy = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    const logger = createLogger("test-ctx");
    logger.warn("careful");
    logger.error("boom");

    expect(stderrSpy).toHaveBeenCalledTimes(2);
  });

  it("merges meta fields into the log entry", () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);

    const logger = createLogger("test-ctx");
    logger.info("with meta", { jobId: "abc", count: 3 });

    const parsed = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
    expect(parsed.jobId).toBe("abc");
    expect(parsed.count).toBe(3);
  });
});
