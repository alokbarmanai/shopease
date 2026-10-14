import { defineConfig, devices } from '@playwright/test';

// Where the app runs. Can be overridden, e.g. BASE_URL=http://staging.example npm test
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const isCI = !!process.env.CI;

export default defineConfig({
    testDir: './tests',

    // The app keeps ONE shared in-memory data store and every test resets it,
    // so tests must run one at a time (see the explanation in the lesson).
    workers: 1,
    fullyParallel: false,

    // Fail the CI run if someone leaves test.only in the code.
    forbidOnly: isCI,

    // Retry failed tests in CI only; every flaky pass must be investigated (Test Plan §8).
    retries: isCI ? 2 : 0,

    reporter: [['list'], ['html', { open: isCI ? 'never' : 'on-failure' }]],

    timeout: 30_000,
    expect: { timeout: 5_000 },

    use: {
        baseURL: BASE_URL,
        // Evidence for failures (Test Plan §8).
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        // Same dates and formats on every machine (Test Plan §7).
        locale: 'en-US',
        timezoneId: 'UTC',
    },

    projects: [
        {
            name: 'api',
            testDir: './tests/api',
        },
        {
            name: 'chromium',
            testDir: './tests/ui',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            testDir: './tests/ui',
            use: { ...devices['Desktop Firefox'] },
        },
    ],

    // Start the ShopEase app before the tests, and stop it afterwards.
    webServer: {
        command: 'npm start',
        cwd: '../shopease-app',
        url: `${BASE_URL}/api/health`,
        reuseExistingServer: !isCI,
        timeout: 30_000,
    },
});