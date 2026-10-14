import type { Locator, Page } from '@playwright/test';

export class LoginPage {
    readonly username: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    readonly error: Locator;

    constructor(readonly page: Page) {
        this.username = page.getByTestId('username-input');
        this.password = page.getByTestId('password-input');
        this.loginButton = page.getByTestId('login-button');
        this.error = page.getByTestId('login-error');
    }

    async goto(): Promise<void> {
        await this.page.goto('/');
    }

    async login(username: string, password: string): Promise<void> {
        await this.username.fill(username);
        await this.password.fill(password);
        await this.loginButton.click();
    }
}