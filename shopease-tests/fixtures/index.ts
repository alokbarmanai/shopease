import { test as base, expect } from '@playwright/test';
import { ShopEaseApi } from '../api/ShopEaseApi';

type Fixtures = {
    resetData: void;
    api: ShopEaseApi;
};

// Our own `test`: Playwright's test plus ShopEase fixtures.
export const test = base.extend<Fixtures>({
    // Runs automatically before EVERY test: fresh seed data (Test Plan §7).
    resetData: [
        async ({ request }, use) => {
            const response = await request.post('/api/test/reset');
            expect(response.ok(), 'POST /api/test/reset failed').toBeTruthy();
            await use();
        },
        { auto: true },
    ],

    // A ShopEase API client for the test to use.
    api: async ({ request }, use) => {
        await use(new ShopEaseApi(request));
    },
});

export { expect };