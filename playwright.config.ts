import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 2,
  use: { baseURL: process.env["E2E_BASE_URL"] ?? "http://localhost:8080", ...devices["Pixel 7"] },
});
