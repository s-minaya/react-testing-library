import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTest.ts"],
    globals: true,
    coverage: {
      exclude: [
        "**/*.config.ts",
        "**/*.config.js",
        "**/*.types.ts",
        "**/*.d.ts",
        "**/types",
      ],
      thresholds: {
        functions: 80,
      },
    },
  },
});
