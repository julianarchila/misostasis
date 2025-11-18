import { defineConfig } from "vitest/config"
import path from "path"
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],  // 👈 NECESARIO
  },

  logLevel: "error",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
