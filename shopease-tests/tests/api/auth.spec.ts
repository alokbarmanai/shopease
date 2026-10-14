import { test, expect } from '../../fixtures';
import { USERS } from '../../test-data/users';

test.describe('Auth API (BR-01)', { tag: '@api' }, () => {
    test('valid login returns a token and the user name', { tag: '@smoke' }, async ({ api }) => {
        const response = await api.login(USERS.alice.username, USERS.alice.password);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.token).toMatch(/^[0-9a-f-]{36}$/);
        expect(body.username).toBe('alice');
        expect(body.fullName).toBe('Alice Johnson');
    });

    const invalidLogins = [
        { title: 'wrong password', username: 'alice', password: 'wrong123', status: 401, error: 'Invalid username or password' },
        { title: 'unknown user', username: 'nobody', password: 'Shop@123', status: 401, error: 'Invalid username or password' },
        { title: 'locked user with correct password', username: 'locked_user', password: 'Shop@123', status: 403, error: 'Your account is locked. Please contact support' },
        { title: 'locked user with wrong password', username: 'locked_user', password: 'wrong123', status: 401, error: 'Invalid username or password' },
        { title: 'empty password', username: 'alice', password: '', status: 400, error: 'Username and password are required' },
        { title: 'empty username', username: '', password: 'Shop@123', status: 400, error: 'Username and password are required' },
    ];

    for (const { title, username, password, status, error } of invalidLogins) {
        test(`rejects login: ${title}`, async ({ api }) => {
            const response = await api.login(username, password);

            expect(response.status()).toBe(status);
            expect(await response.json()).toEqual({ error });
        });
    }

    test('logout without a token is rejected', async ({ api }) => {
        const response = await api.logout();

        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ error: 'Please log in to continue' });
    });

    test('logout with a valid token succeeds', async ({ api }) => {
        await api.loginAs(USERS.alice);
        const response = await api.logout();

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({ message: 'Logged out' });
    });

    test('a token cannot be reused after logout', async ({ api }) => {
        await api.loginAs(USERS.alice);
        await api.logout();
        const response = await api.logout();

        expect(response.status()).toBe(401);
    });

    test('a tampered token is rejected', async ({ api }) => {
        const token = await api.loginAs(USERS.alice);
        api.useToken(token.slice(0, -6) + 'abc123');
        const response = await api.logout();

        expect(response.status()).toBe(401);
    });
});

test.describe('Protected endpoints require login', { tag: '@api' }, () => {
    for (const path of ['/api/products', '/api/cart', '/api/orders']) {
        test(`GET ${path} without a token returns 401`, async ({ request }) => {
            const response = await request.get(path);

            expect(response.status()).toBe(401);
            expect(await response.json()).toEqual({ error: 'Please log in to continue' });
        });
    }
});