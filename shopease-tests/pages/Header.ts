import type { Locator, Page } from '@playwright/test';

// The header shown on every logged-in page (layout.js).
export class Header {
    readonly userName: Locator;
    readonly cartBadge: Locator;
    readonly productsLink: Locator;
    readonly ordersLink: Locator;
    readonly cartLink: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        this.userName = page.getByTestId('nav-user');
        this.cartBadge = page.getByTestId('cart-badge');
        this.productsLink = page.getByTestId('nav-products');
        this.ordersLink = page.getByTestId('nav-orders');
        this.cartLink = page.getByTestId('nav-cart');
        this.logoutButton = page.getByTestId('logout-button');
    }

    async logout(): Promise<void> {
        await this.logoutButton.click();
    }
}