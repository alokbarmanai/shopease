import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
    test('opens with the login form', { tag: ['@smoke', '@ui'] }, async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/Login/);
        await expect(page.getByTestId('username-input')).toBeVisible();
        await expect(page.getByTestId('password-input')).toBeVisible();
        await expect(page.getByTestId('login-button')).toBeVisible();
    });
});