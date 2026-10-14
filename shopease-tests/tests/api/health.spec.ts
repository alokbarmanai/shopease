import { test, expect } from '@playwright/test';

test.describe('Health check', () => {
    test('GET /api/health returns ok', { tag: ['@smoke', '@api'] }, async ({ request }) => {
        const response = await request.get('/api/health');

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({ status: 'ok' });
    });
});