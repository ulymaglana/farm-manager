import { describe, it, expect, afterEach, vi } from "vitest";
import { getHealth } from "./api.js";

describe("getHealth()", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON when fetch succeeds with ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok", db: "connected" }),
      })
    );

    const result = await getHealth();

    expect(result).toEqual({ status: "ok", db: "connected" });
  });

  it("returns null when fetch throws (network error)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED"))
    );

    const result = await getHealth();

    expect(result).toBeNull();
  });

  it("returns null when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false })
    );

    const result = await getHealth();

    expect(result).toBeNull();
  });
});
