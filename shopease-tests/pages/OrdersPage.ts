import type { Locator, Page } from '@playwright/test';
import { Header } from './Header';

export class OrdersPage {
    readonly header: Header;
    readonly emptyState: Locator;
    readonly rows: Locator;

    constructor(readonly page: Page) {
        this.header = new Header(page);
        this.emptyState = page.getByTestId('orders-empty');
        this.rows = page.getByTestId('orders-list').locator('tr');
    }

    async goto(): Promise<void> {
        await this.page.goto('/orders.html');
    }

    row(orderId: string): Locator {
        return this.page.getByTestId(`order-row-${orderId}`);
    }
}