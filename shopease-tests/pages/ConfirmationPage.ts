import type { Locator, Page } from '@playwright/test';
import { Header } from './Header';

export class ConfirmationPage {
    readonly header: Header;
    readonly content: Locator;
    readonly notFound: Locator;
    readonly orderId: Locator;
    readonly orderDate: Locator;
    readonly itemCount: Locator;
    readonly total: Locator;
    readonly viewOrdersLink: Locator;

    constructor(readonly page: Page) {
        this.header = new Header(page);
        this.content = page.getByTestId('confirmation-content');
        this.notFound = page.getByTestId('confirmation-not-found');
        this.orderId = page.getByTestId('order-id');
        this.orderDate = page.getByTestId('order-date');
        this.itemCount = page.getByTestId('order-item-count');
        this.total = page.getByTestId('order-total');
        this.viewOrdersLink = page.getByTestId('view-orders-link');
    }

    async goto(orderId: string): Promise<void> {
        await this.page.goto(`/confirmation.html?orderId=${encodeURIComponent(orderId)}`);
    }
}