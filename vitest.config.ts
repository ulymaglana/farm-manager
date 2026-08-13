import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "apps/api/vitest.config.ts",
      "apps/worker/vitest.config.ts",
      "apps/web/vitest.config.ts",
      "packages/shared/vitest.config.ts",
    ],
    coverage: {
      provider: "v8",
      include: ["apps/*/src/**/*.ts", "packages/*/src/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "**/*.integration.ts",
        "**/__mocks__/**",
        "**/node_modules/**",
        "apps/*/src/index.ts",
      ],
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
    },
  },
});
