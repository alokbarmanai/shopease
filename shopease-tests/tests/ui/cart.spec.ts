import { test, expect } from '../../fixtures';
import { CartPage } from '../../pages/CartPage';
import { PRODUCTS } from '../../test-data/products';
import { COUPONS } from '../../test-data/coupons';

test.describe('Cart page (BR-03, BR-04)', { tag: '@ui' }, () => {
    test('an empty cart says so', async ({ alicePage }) => {
        const cartPage = new CartPage(alicePage);
        await cartPage.goto();

        await expect(cartPage.emptyState).toBeVisible();
        await expect(cartPage.header.cartBadge).toHaveText('0');
    });

    // The remaining tests start with Wireless Mouse + Laptop Stand ($54.49), added through the API.
    test.describe('with items in the cart', () => {
        test.beforeEach(async ({ aliceApi }) => {
            await aliceApi.addItem(PRODUCTS.mouse.id, 1);
            await aliceApi.addItem(PRODUCTS.stand.id, 1);
        });

        test('shows the items and totals', { tag: '@smoke' }, async ({ alicePage }) => {
            const cartPage = new CartPage(alicePage);
            await cartPage.goto();

            await expect(cartPage.row(PRODUCTS.mouse.id).getByTestId('item-name')).toHaveText('Wireless Mouse');
            await expect(cartPage.row(PRODUCTS.stand.id).getByTestId('item-name')).toHaveText('Laptop Stand');
            await expect(cartPage.summary.subtotal).toHaveText('$54.49');
            await expect(cartPage.summary.discount).toHaveText('$0.00');
            await expect(cartPage.summary.shipping).toHaveText('FREE');
            await expect(cartPage.summary.total).toHaveText('$54.49');
            await expect(cartPage.header.cartBadge).toHaveText('2');
        });

        test('changing a quantity updates line total, totals and badge', async ({ alicePage }) => {
            const cartPage = new CartPage(alicePage);
            await cartPage.goto();
            await cartPage.setQuantity(PRODUCTS.mouse.id, 3);

            await expect(cartPage.row(PRODUCTS.mouse.id).getByTestId('item-line-total')).toHaveText('$59.97');
            await expect(cartPage.summary.subtotal).toHaveText('$94.47');
            await expect(cartPage.header.cartBadge).toHaveText('4');
        });

        test('an invalid quantity shows the error and keeps the real value (RULE-01)', async ({ alicePage }) => {
            const cartPage = new CartPage(alicePage);
            await cartPage.goto();
            await cartPage.setQuantity(PRODUCTS.mouse.id, 6);

            await expect(cartPage.message).toHaveText('Quantity must be between 1 and 5');
            await expect(cartPage.quantityInput(PRODUCTS.mouse.id)).toHaveValue('1');
        });

        test('a coupon can be applied in lower case (RULE-05, RQ-03)', async ({ alicePage }) => {
            const cartPage = new CartPage(alicePage);
            await cartPage.goto();
            await cartPage.applyCoupon('save10');

            await expect(cartPage.appliedCoupon).toHaveText('SAVE10');
            await expect(cartPage.couponInput).toBeHidden(); // a second coupon cannot be entered (RULE-04)
            await expect(cartPage.summary.discount).toHaveText('-$5.45');
            await expect(cartPage.summary.shipping).toHaveText('$5.00'); // $49.04 is below $50
            await expect(cartPage.summary.total).toHaveText('$54.04');
        });

        test('removing the coupon restores the price', async ({ alicePage }) => {
            const cartPage = new CartPage(alicePage);
            await cartPage.goto();
            await cartPage.applyCoupon(COUPONS.save10);
            await cartPage.removeCoupon();

            await expect(cartPage.summary.discount).toHaveText('$0.00');
            await expect(cartPage.summary.total).toHaveText('$54.49');
            await expect(cartPage.couponInput).toBeVisible();
        });

        test('an invalid coupon shows the server message', async ({ alicePage }) => {
            const cartPage = new CartPage(alicePage);
            await cartPage.goto();
            await cartPage.applyCoupon('BADCODE');

            await expect(cartPage.message).toHaveText('Invalid coupon code');
        });

        test('removing every item shows the empty cart', async ({ alicePage }) => {
            const cartPage = new CartPage(alicePage);
            await cartPage.goto();
            await cartPage.removeItem(PRODUCTS.mouse.id);
            await expect(cartPage.row(PRODUCTS.mouse.id)).toHaveCount(0);
            await cartPage.removeItem(PRODUCTS.stand.id);

            await expect(cartPage.emptyState).toBeVisible();
            await expect(cartPage.header.cartBadge).toHaveText('0');
        });
    });
});