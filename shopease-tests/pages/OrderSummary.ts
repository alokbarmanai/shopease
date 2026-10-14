import type { Locator, Page } from '@playwright/test';

// The totals block shared by the cart and checkout pages (renderTotals in layout.js).
export class OrderSummary {
    readonly subtotal: Locator;
    readonly discount: Locator;
    readonly shipping: Locator;
    readonly total: Locator;

    constructor(page: Page) {
        this.subtotal = page.getByTestId('summary-subtotal');
        this.discount = page.getByTestId('summary-discount');
        this.shipping = page.getByTestId('summary-shipping');
        this.total = page.getByTestId('summary-total');
    }
}