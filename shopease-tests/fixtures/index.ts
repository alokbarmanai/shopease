import { test as base, expect, type Page } from '@playwright/test';
import { ShopEaseApi } from '../api/ShopEaseApi';
import { USERS } from '../test-data/users';

type Fixtures = {
    resetData: void;
    api: ShopEaseApi;
    aliceApi: ShopEaseApi;
    bobApi: ShopEaseApi;
    alicePage: Page;
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

    // A ShopEase API client, not logged in.
    // Depends on resetData so it is always created AFTER the reset.
    api: async ({ request, resetData }, use) => {
        await use(new ShopEaseApi(request));
    },

    // An API client already logged in as alice.
    aliceApi: async ({ request, resetData }, use) => {
        const client = new ShopEaseApi(request);
        await client.loginAs(USERS.alice);
        await use(client);
    },

    // A second customer, for isolation and multi-user tests.
    bobApi: async ({ request, resetData }, use) => {
        const client = new ShopEaseApi(request);
        await client.loginAs(USERS.bob);
        await use(client);
    },

    // A browser page already logged in as alice, without using the login form.
    // Logs in through the API and stores the session where the app expects it (api.js).
    alicePage: async ({ page, request, resetData }, use) => {
        const token = await new ShopEaseApi(request).loginAs(USERS.alice);
        await page.goto('/');
        await page.evaluate(
            ({ token, user }) => {
                localStorage.setItem('shopease_token', token);
                localStorage.setItem('shopease_user', JSON.stringify(user));
            },
            { token, user: { username: USERS.alice.username, fullName: USERS.alice.fullName } },
        );
        await use(page);
    },
});

export { expect };