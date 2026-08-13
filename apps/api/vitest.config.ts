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
