import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { USERS } from '../../test-data/users';

test.describe('Login page (BR-01)', { tag: '@ui' }, () => {
    test('opens with the login form', { tag: '@smoke' }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await expect(page).toHaveTitle(/Login/);
        await expect(loginPage.username).toBeVisible();
        await expect(loginPage.password).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();
    });

    test('valid login opens the products page and greets the user', { tag: '@smoke' }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(USERS.alice.username, USERS.alice.password);

        await expect(page).toHaveURL(/\/products\.html$/);
        await expect(new ProductsPage(page).header.userName).toHaveText('Hi, Alice Johnson');
    });

    const invalidLogins = [
        { title: 'empty fields', username: '', password: '', error: 'Username and password are required' },
        { title: 'wrong password', username: 'alice', password: 'wrong123', error: 'Invalid username or password' },
        { title: 'locked account', username: 'locked_user', password: 'Shop@123', error: 'Your account is locked. Please contact support' },
    ];

    for (const { title, username, password, error } of invalidLogins) {
        test(`shows an error for ${title}`, async ({ page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();
            await loginPage.login(username, password);

            await expect(loginPage.error).toHaveText(error);
            await expect(page).toHaveURL(/\/$|\/index\.html$/);
        });
    }

    test('masks the password and marks fields as required (NFR-03)', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await expect(loginPage.password).toHaveAttribute('type', 'password');
        await expect(loginPage.username).toHaveAttribute('aria-required', 'true');
        await expect(loginPage.password).toHaveAttribute('aria-required', 'true');
    });

    test('logout returns to the login page and ends the session', async ({ alicePage }) => {
        const productsPage = new ProductsPage(alicePage);
        await productsPage.goto();
        await productsPage.header.logout();

        await expect(alicePage).toHaveURL(/\/index\.html$/);
        await productsPage.goto();
        await expect(alicePage).toHaveURL(/\/index\.html$/);
    });

    test('store pages require login', async ({ page }) => {
        await new ProductsPage(page).goto();

        await expect(page).toHaveURL(/\/index\.html$/);
    });
});