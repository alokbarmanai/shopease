import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../test-data/products';
import { COUPONS } from '../../test-data/coupons';
import { VALID_SHIPPING } from '../../test-data/shipping';

test.describe('Orders API: checkout validation (BR-05, RULE-10 to RULE-12)', { tag: '@api' }, () => {
    test('rejects an order with an empty cart', async ({ aliceApi }) => {
        const response = await aliceApi.placeOrder(VALID_SHIPPING);

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ error: 'Cart is empty' });
    });

    const invalidShipping: { title: string; shipping: Record<string, unknown>; error: string }[] = [
        { title: 'a missing ZIP Code', shipping: { ...VALID_SHIPPING, zipCode: undefined }, error: 'ZIP Code is required' },
        { title: 'a blank Full Name', shipping: { ...VALID_SHIPPING, fullName: '   ' }, error: 'Full Name is required' },
        { title: 'a 4-digit ZIP Code', shipping: { ...VALID_SHIPPING, zipCode: '1234' }, error: 'ZIP Code must be exactly 5 digits' },
        { title: 'a 6-digit ZIP Code', shipping: { ...VALID_SHIPPING, zipCode: '733011' }, error: 'ZIP Code must be exactly 5 digits' },
        { title: 'a 5-digit phone', shipping: { ...VALID_SHIPPING, phone: '12345' }, error: 'Phone must be exactly 10 digits' },
        { title: 'a phone with dashes (RQ-05)', shipping: { ...VALID_SHIPPING, phone: '512-555-0100' }, error: 'Phone must be exactly 10 digits' },
    ];

    for (const { title, shipping, error } of invalidShipping) {
        test(`rejects ${title}`, async ({ aliceApi }) => {
            await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
            const response = await aliceApi.placeOrder(shipping);

            expect(response.status()).toBe(400);
            expect(await response.json()).toEqual({ error });
        });
    }

    test('a rejected order changes nothing', async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        await aliceApi.placeOrder({ ...VALID_SHIPPING, zipCode: '1234' });

        expect((await (await aliceApi.getCart()).json()).itemCount).toBe(1);
        expect((await (await aliceApi.getOrders()).json())).toEqual([]);
        const [keyboard] = await (await aliceApi.getProducts({ search: 'keyboard' })).json();
        expect(keyboard.stock).toBe(10);
    });
});

test.describe('Orders API: placing an order (BR-06, RULE-13)', { tag: '@api' }, () => {
    test('a valid order returns 201 with the order details', { tag: '@smoke' }, async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        const response = await aliceApi.placeOrder(VALID_SHIPPING);

        expect(response.status()).toBe(201);
        const order = await response.json();
        expect(order.orderId).toMatch(/^SE-\d{6}$/);
        expect(Date.parse(order.createdAt)).not.toBeNaN();
        expect(order).toMatchObject({
            username: 'alice',
            paymentMethod: 'Cash on Delivery',
            shipping: VALID_SHIPPING,
            itemCount: 1,
            couponCode: null,
            subtotalCents: 4999,
            discountCents: 0,
            shippingCents: 500,
            totalCents: 5499,
        });
    });

    test('empties the cart and reduces stock', async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        await aliceApi.placeOrder(VALID_SHIPPING);

        expect((await (await aliceApi.getCart()).json()).itemCount).toBe(0);
        const [keyboard] = await (await aliceApi.getProducts({ search: 'keyboard' })).json();
        expect(keyboard.stock).toBe(9);
    });

    test('keeps the coupon discount in the order total', async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        await aliceApi.applyCoupon(COUPONS.save10);
        const order = await (await aliceApi.placeOrder(VALID_SHIPPING)).json();

        expect(order).toMatchObject({ couponCode: 'SAVE10', discountCents: 500, totalCents: 4999 });
    });
});

test.describe('Orders API: order history (BR-07)', { tag: '@api' }, () => {
    test('lists orders newest first', async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        const first = await (await aliceApi.placeOrder(VALID_SHIPPING)).json();
        await aliceApi.addItem(PRODUCTS.mouse.id, 1);
        const second = await (await aliceApi.placeOrder(VALID_SHIPPING)).json();

        const history = await (await aliceApi.getOrders()).json();
        expect(history.map((o: { orderId: string }) => o.orderId)).toEqual([second.orderId, first.orderId]);
        expect(history.map((o: { totalCents: number }) => o.totalCents)).toEqual([2499, 5499]);
    });

    test('returns summary fields only (no shipping address)', async ({ aliceApi }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        await aliceApi.placeOrder(VALID_SHIPPING);

        const [summary] = await (await aliceApi.getOrders()).json();
        expect(Object.keys(summary)).toEqual(['orderId', 'createdAt', 'itemCount', 'totalCents']);
    });

    test('customers see only their own orders', async ({ aliceApi, bobApi }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        await aliceApi.placeOrder(VALID_SHIPPING);

        expect(await (await bobApi.getOrders()).json()).toEqual([]);
    });
});

test.describe('Orders API: two customers, one product (RULE-02)', { tag: '@api' }, () => {
    test('the second checkout fails when the stock was sold in the meantime', async ({ aliceApi, bobApi }) => {
        // Adding to a cart does not reserve stock: both carts hold the last 2 USB-C Hubs.
        await aliceApi.addItem(PRODUCTS.hub.id, 2);
        await bobApi.addItem(PRODUCTS.hub.id, 2);

        const bobOrder = await bobApi.placeOrder({ ...VALID_SHIPPING, fullName: 'Bob Smith' });
        expect(bobOrder.status()).toBe(201);

        const aliceOrder = await aliceApi.placeOrder(VALID_SHIPPING);
        expect(aliceOrder.status()).toBe(400);
        expect(await aliceOrder.json()).toEqual({ error: 'Only 0 left in stock for USB-C Hub' }); // RQ-06

        const [hub] = await (await aliceApi.getProducts({ search: 'hub' })).json();
        expect(hub).toMatchObject({ stock: 0, inStock: false }); // never negative
        expect((await (await aliceApi.getCart()).json()).itemCount).toBe(2); // alice keeps her cart
        expect(await (await aliceApi.getOrders()).json()).toEqual([]);
    });
});