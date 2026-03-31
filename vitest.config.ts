import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts", "actions/**/*.test.ts", "lib/**/*.test.ts"],
    exclude: ["node_modules", "app/**", "components/**"],
    coverage: {
      provider: "v8",
      include: ["actions/**/*.ts", "lib/**/*.ts"],
      exclude: ["lib/prisma.ts", "lib/mock-data.ts"],
    },
  },
});
