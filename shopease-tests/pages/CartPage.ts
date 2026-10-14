import type { Locator, Page } from '@playwright/test';
import { Header } from './Header';
import { OrderSummary } from './OrderSummary';

export class CartPage {
    readonly header: Header;
    readonly summary: OrderSummary;
    readonly emptyState: Locator;
    readonly message: Locator;
    readonly couponInput: Locator;
    readonly applyCouponButton: Locator;
    readonly appliedCoupon: Locator;
    readonly removeCouponButton: Locator;
    readonly checkoutButton: Locator;

    constructor(readonly page: Page) {
        this.header = new Header(page);
        this.summary = new OrderSummary(page);
        this.emptyState = page.getByTestId('cart-empty');
        this.message = page.getByTestId('page-message');
        this.couponInput = page.getByTestId('coupon-input');
        this.applyCouponButton = page.getByTestId('apply-coupon-button');
        this.appliedCoupon = page.getByTestId('applied-coupon');
        this.removeCouponButton = page.getByTestId('remove-coupon-button');
        this.checkoutButton = page.getByTestId('checkout-button');
    }

    async goto(): Promise<void> {
        await this.page.goto('/cart.html');
    }

    row(productId: string): Locator {
        return this.page.getByTestId(`cart-row-${productId}`);
    }

    quantityInput(productId: string): Locator {
        return this.page.getByTestId(`quantity-input-${productId}`);
    }

    // The cart reacts to the input's "change" event, which fires when the field loses focus.
    async setQuantity(productId: string, quantity: number): Promise<void> {
        await this.quantityInput(productId).fill(String(quantity));
        await this.quantityInput(productId).press('Tab');
    }

    async removeItem(productId: string): Promise<void> {
        await this.page.getByTestId(`remove-item-${productId}`).click();
    }

    async applyCoupon(code: string): Promise<void> {
        await this.couponInput.fill(code);
        await this.applyCouponButton.click();
    }

    async removeCoupon(): Promise<void> {
        await this.removeCouponButton.click();
    }

    async proceedToCheckout(): Promise<void> {
        await this.checkoutButton.click();
    }
}