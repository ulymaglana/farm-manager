import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "api",
    environment: "node",
    include: ["src/**/*.test.ts"],
    unstubGlobals: true,
    restoreMocks: true,
    env: {
      JWT_SECRET: "test-secret-that-is-long-enough-for-jwt-signing",
      NODE_ENV: "test",
    },
  },
  resolve: {
    alias: {
      "@myapp/shared": new URL(
        "../../packages/shared/src/index.ts",
        import.meta.url
      ).pathname,
    },
  },
});
