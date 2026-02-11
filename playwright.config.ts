import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    timeout: 60_000,
    expect: { timeout: 10_000 },
    retries: 1,
    fullyParallel: true,
    reporter: [["html", { open: "never" }], ["list"]],
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },

    // Start the app automatically for tests
    webServer: {
        command: "npm run preview",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },

    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    ],
});
