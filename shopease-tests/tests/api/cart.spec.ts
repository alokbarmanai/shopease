import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../test-data/products';
import { COUPONS } from '../../test-data/coupons';

test.describe('Cart API (BR-03)', { tag: '@api' }, () => {
    test('a new customer has an empty cart', async ({ aliceApi }) => {
        const response = await aliceApi.getCart();

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({
            items: [],
            itemCount: 0,
            couponCode: null,
            subtotalCents: 0,
            discountCents: 0,
            shippingCents: 0,
            totalCents: 0,
        });
    });

    test('adding an item returns the updated cart', { tag: '@smoke' }, async ({ aliceApi }) => {
        const response = await aliceApi.addItem(PRODUCTS.mouse.id, 2);

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({
            items: [
                { productId: 'P001', name: 'Wireless Mouse', priceCents: 1999, quantity: 2, lineTotalCents: 3998 },
            ],
            itemCount: 2,
            couponCode: null,
            subtotalCents: 3998,
            discountCents: 0,
            shippingCents: 500,
            totalCents: 4498,
        });
    });

    test('the cart is remembered between requests', async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.mouse.id, 2);
        const response = await aliceApi.getCart();

        expect((await response.json()).itemCount).toBe(2);
    });

    test('changing the quantity updates totals and shipping (RULE-07)', async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.mouse.id, 2);
        const response = await aliceApi.updateQuantity(PRODUCTS.mouse.id, 4);

        expect(response.status()).toBe(200);
        expect(await response.json()).toMatchObject({
            itemCount: 4,
            subtotalCents: 7996,
            shippingCents: 0,
            totalCents: 7996,
        });
    });

    test('removing an item empties the cart', async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.mouse.id, 2);
        const response = await aliceApi.removeItem(PRODUCTS.mouse.id);

        expect(response.status()).toBe(200);
        expect(await response.json()).toMatchObject({ items: [], itemCount: 0, totalCents: 0 });
    });

    test('removing an item that is not in the cart returns 404', async ({ aliceApi }) => {
        const response = await aliceApi.removeItem(PRODUCTS.mouse.id);

        expect(response.status()).toBe(404);
        expect(await response.json()).toEqual({ error: 'Product is not in the cart' });
    });

    test('updating an item that is not in the cart returns 404', async ({ aliceApi }) => {
        const response = await aliceApi.updateQuantity('P999', 1);

        expect(response.status()).toBe(404);
        expect(await response.json()).toEqual({ error: 'Product is not in the cart' });
    });

    const invalidAdds = [
        { title: 'out-of-stock product (RULE-03)', productId: PRODUCTS.webcam.id, quantity: 1, status: 400, error: 'Product is out of stock' },
        { title: 'quantity 0 (RULE-01)', productId: PRODUCTS.mouse.id, quantity: 0, status: 400, error: 'Quantity must be between 1 and 5' },
        { title: 'quantity 6 (RULE-01)', productId: PRODUCTS.mouse.id, quantity: 6, status: 400, error: 'Quantity must be between 1 and 5' },
        { title: 'more than the stock (RULE-02)', productId: PRODUCTS.hub.id, quantity: 3, status: 400, error: 'Only 2 left in stock' },
        { title: 'unknown product', productId: 'P999', quantity: 1, status: 404, error: 'Product not found' },
    ];

    for (const { title, productId, quantity, status, error } of invalidAdds) {
        test(`rejects adding: ${title}`, async ({ aliceApi }) => {
            const response = await aliceApi.addItem(productId, quantity);

            expect(response.status()).toBe(status);
            expect(await response.json()).toEqual({ error });
        });
    }

    test(
        'rejects a non-numeric quantity',
        { annotation: { type: 'issue', description: 'https://github.com/alokbarmanai/shopease/issues/2' } },
        async ({ aliceApi }) => {
            await aliceApi.addItem(PRODUCTS.mouse.id, 1);
            const response = await aliceApi.updateQuantity(PRODUCTS.mouse.id, '3');

            // Status is correct; the message is misleading (DEF-001, deferred), so it is not asserted.
            expect(response.status()).toBe(400);
        },
    );

    test('customers cannot see each other\'s carts', async ({ aliceApi, bobApi }) => {
        await aliceApi.addItem(PRODUCTS.stand.id, 1);

        expect((await (await bobApi.getCart()).json()).items).toEqual([]);
        expect((await (await aliceApi.getCart()).json()).items).toHaveLength(1);
    });
});

test.describe('Coupon API (BR-04)', { tag: '@api' }, () => {
    // Precondition for most coupon tests: alice has 1 x Mechanical Keyboard ($49.99).
    test.beforeEach(async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
    });

    test('SAVE10 gives 10% off (RULE-06, RQ-01)', { tag: '@smoke' }, async ({ aliceApi }) => {
        const response = await aliceApi.applyCoupon(COUPONS.save10);

        expect(response.status()).toBe(200);
        expect(await response.json()).toMatchObject({
            couponCode: 'SAVE10',
            discountCents: 500,
            shippingCents: 500,
            totalCents: 4999,
        });
    });

    test('codes are not case-sensitive (RULE-05)', async ({ aliceApi }) => {
        const response = await aliceApi.applyCoupon('save10');

        expect(response.status()).toBe(200);
        expect((await response.json()).couponCode).toBe('SAVE10');
    });

    test('rejects an unknown code', async ({ aliceApi }) => {
        const response = await aliceApi.applyCoupon('BADCODE');

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ error: 'Invalid coupon code' });
    });

    test('rejects an expired code', async ({ aliceApi }) => {
        const response = await aliceApi.applyCoupon(COUPONS.expired);

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ error: 'This coupon has expired' });
    });

    test('allows only one coupon per order (RULE-04)', async ({ aliceApi }) => {
        await aliceApi.applyCoupon(COUPONS.save10);
        const response = await aliceApi.applyCoupon(COUPONS.flat5);

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ error: 'Only one coupon can be applied per order' });
    });

    test('removing the coupon restores the full price', async ({ aliceApi }) => {
        await aliceApi.applyCoupon(COUPONS.save10);
        const response = await aliceApi.removeCoupon();

        expect(response.status()).toBe(200);
        expect(await response.json()).toMatchObject({ couponCode: null, discountCents: 0, totalCents: 5499 });
    });

    test('rejects a coupon on an empty cart', async ({ bobApi }) => {
        const response = await bobApi.applyCoupon(COUPONS.save10);

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ error: 'Cart is empty' });
    });

    test('FLAT5 requires a $30.00 subtotal (BRD 7.1)', async ({ bobApi }) => {
        await bobApi.addItem(PRODUCTS.mouse.id, 1);
        const response = await bobApi.applyCoupon(COUPONS.flat5);

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ error: 'This coupon requires a subtotal of at least $30.00' });
    });

    test('FLAT5 can leave the total unchanged (RQ-03)', async ({ bobApi }) => {
        await bobApi.addItem(PRODUCTS.mouse.id, 1);
        await bobApi.addItem(PRODUCTS.stand.id, 1);
        const response = await bobApi.applyCoupon(COUPONS.flat5);

        expect(await response.json()).toMatchObject({
            subtotalCents: 5449,
            discountCents: 500,
            shippingCents: 500,
            totalCents: 5449,
        });
    });
});