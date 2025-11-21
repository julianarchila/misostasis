import { defineConfig } from "vitest/config"
import path from "path"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths(), react()],

  test: {
    globals: true,              // habilita describe, it, expect
    environment: "jsdom",       // necesario para React
    setupFiles: ["./src/tests/setup.ts"],

    // Forzamos a Vitest a detectar tests .test.tsx donde sea
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/*.spec.ts",
      "src/**/*.spec.tsx",
    ],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})