import { test, expect } from '../../fixtures';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { PRODUCTS } from '../../test-data/products';
import { VALID_SHIPPING } from '../../test-data/shipping';

test.describe('Checkout page (BR-05)', { tag: '@ui' }, () => {
    test('with an empty cart there is no form', async ({ alicePage }) => {
        const checkoutPage = new CheckoutPage(alicePage);
        await checkoutPage.goto();

        await expect(checkoutPage.emptyState).toBeVisible();
        await expect(checkoutPage.placeOrderButton).toBeHidden();
    });

    test.describe('with a Mechanical Keyboard in the cart', () => {
        test.beforeEach(async ({ aliceApi }) => {
            await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        });

        test('shows the order summary', async ({ alicePage }) => {
            const checkoutPage = new CheckoutPage(alicePage);
            await checkoutPage.goto();

            await expect(checkoutPage.summaryItem(PRODUCTS.keyboard.id)).toContainText('Mechanical Keyboard × 1');
            await expect(checkoutPage.summaryItem(PRODUCTS.keyboard.id)).toContainText('$49.99');
            await expect(checkoutPage.summary.shipping).toHaveText('$5.00');
            await expect(checkoutPage.summary.total).toHaveText('$54.99');
        });

        test('an empty form shows the first required field (RULE-12)', async ({ alicePage }) => {
            const checkoutPage = new CheckoutPage(alicePage);
            await checkoutPage.goto();
            await checkoutPage.placeOrder();

            await expect(checkoutPage.message).toHaveText('Full Name is required');
        });

        const invalidDetails = [
            { title: 'a 4-digit ZIP Code (RULE-10)', details: { ...VALID_SHIPPING, zipCode: '1234' }, error: 'ZIP Code must be exactly 5 digits' },
            { title: 'a phone with dashes (RULE-11, RQ-05)', details: { ...VALID_SHIPPING, phone: '512-555-0100' }, error: 'Phone must be exactly 10 digits' },
        ];

        for (const { title, details, error } of invalidDetails) {
            test(`shows an error for ${title}`, async ({ alicePage }) => {
                const checkoutPage = new CheckoutPage(alicePage);
                await checkoutPage.goto();
                await checkoutPage.fillShipping(details);
                await checkoutPage.placeOrder();

                await expect(checkoutPage.message).toHaveText(error);
                await expect(checkoutPage.placeOrderButton).toBeEnabled(); // the customer can fix and retry
            });
        }
    });
});