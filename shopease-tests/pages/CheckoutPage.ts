import type { Locator, Page } from '@playwright/test';
import type { ShippingDetails } from '../test-data/shipping';
import { Header } from './Header';
import { OrderSummary } from './OrderSummary';

export class CheckoutPage {
    readonly header: Header;
    readonly summary: OrderSummary;
    readonly emptyState: Locator;
    readonly message: Locator;
    readonly fullName: Locator;
    readonly address: Locator;
    readonly city: Locator;
    readonly zipCode: Locator;
    readonly phone: Locator;
    readonly placeOrderButton: Locator;

    constructor(readonly page: Page) {
        this.header = new Header(page);
        this.summary = new OrderSummary(page);
        this.emptyState = page.getByTestId('checkout-empty');
        this.message = page.getByTestId('page-message');
        this.fullName = page.getByTestId('fullname-input');
        this.address = page.getByTestId('address-input');
        this.city = page.getByTestId('city-input');
        this.zipCode = page.getByTestId('zip-input');
        this.phone = page.getByTestId('phone-input');
        this.placeOrderButton = page.getByTestId('place-order-button');
    }

    async goto(): Promise<void> {
        await this.page.goto('/checkout.html');
    }

    summaryItem(productId: string): Locator {
        return this.page.getByTestId(`summary-item-${productId}`);
    }

    async fillShipping(details: ShippingDetails): Promise<void> {
        await this.fullName.fill(details.fullName);
        await this.address.fill(details.address);
        await this.city.fill(details.city);
        await this.zipCode.fill(details.zipCode);
        await this.phone.fill(details.phone);
    }

    async placeOrder(): Promise<void> {
        await this.placeOrderButton.click();
    }
}