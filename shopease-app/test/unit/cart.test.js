// Unit tests for the cart and coupon rules (BRD BR-03, BR-04, RULE-01 to RULE-05).

const { describe, test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const cart = require('../../src/services/cart');
const { resetData } = require('../../src/data/store');

// Every test starts from fresh seed data (test isolation).
beforeEach(() => {
    resetData();
});

describe('addItem (BR-03)', () => {
    test('adds a new product to an empty cart', () => {
        const result = cart.addItem('alice', 'P001', 2);
        assert.equal(result.items.length, 1);
        assert.equal(result.items[0].quantity, 2);
        assert.equal(result.itemCount, 2);
    });

    test('adding the same product again increases its quantity', () => {
        cart.addItem('alice', 'P001', 2);
        const result = cart.addItem('alice', 'P001', 1);
        assert.equal(result.items.length, 1);
        assert.equal(result.items[0].quantity, 3);
    });

    test('rejects an unknown product', () => {
        assert.throws(() => cart.addItem('alice', 'P999', 1), {
            status: 404,
            message: 'Product not found',
        });
    });

    test('rejects an out-of-stock product (RULE-03)', () => {
        assert.throws(() => cart.addItem('alice', 'P006', 1), {
            status: 400,
            message: 'Product is out of stock',
        });
    });
});

describe('quantity rules (RULE-01, RULE-02)', () => {
    for (const quantity of [0, 6, 2.5, '2']) {
        test(`rejects quantity ${JSON.stringify(quantity)}`, () => {
            assert.throws(() => cart.addItem('alice', 'P001', quantity), {
                status: 400,
                message: 'Quantity must be between 1 and 5',
            });
        });
    }

    test('accepts the boundary values 1 and 5', () => {
        cart.addItem('alice', 'P001', 1);
        const result = cart.addItem('alice', 'P002', 5);
        assert.equal(result.itemCount, 6);
    });

    test('checks the new total, not only the amount added', () => {
        cart.addItem('alice', 'P001', 4);
        assert.throws(() => cart.addItem('alice', 'P001', 2), {
            status: 400,
            message: 'Quantity must be between 1 and 5',
        });
        assert.equal(cart.getCart('alice').items[0].quantity, 4); // unchanged
    });

    test('cannot add more than the stock', () => {
        cart.addItem('alice', 'P003', 2);
        assert.throws(() => cart.addItem('alice', 'P003', 1), {
            status: 400,
            message: 'Only 2 left in stock',
        });
    });
});

describe('updateQuantity and removeItem (BR-03)', () => {
    test('updateQuantity changes the quantity', () => {
        cart.addItem('alice', 'P001', 1);
        const result = cart.updateQuantity('alice', 'P001', 4);
        assert.equal(result.items[0].quantity, 4);
    });

    test('updateQuantity rejects a product that is not in the cart', () => {
        assert.throws(() => cart.updateQuantity('alice', 'P001', 1), {
            status: 404,
            message: 'Product is not in the cart',
        });
    });

    test('removing the same product twice fails the second time', () => {
        cart.addItem('alice', 'P001', 1);
        cart.removeItem('alice', 'P001');
        assert.throws(() => cart.removeItem('alice', 'P001'), {
            status: 404,
            message: 'Product is not in the cart',
        });
    });
});

describe('cart isolation', () => {
    test('each customer has their own cart', () => {
        cart.addItem('alice', 'P004', 1);
        assert.equal(cart.getCart('bob').items.length, 0);
    });
});

describe('coupons (BR-04)', () => {
    test('codes are not case-sensitive and spaces are ignored (RULE-05)', () => {
        cart.addItem('alice', 'P002', 1);
        const result = cart.applyCoupon('alice', '  save10 ');
        assert.equal(result.couponCode, 'SAVE10');
        assert.equal(result.discountCents, 500);
    });

    test('only one coupon per order (RULE-04)', () => {
        cart.addItem('alice', 'P002', 1);
        cart.applyCoupon('alice', 'SAVE10');
        assert.throws(() => cart.applyCoupon('alice', 'FLAT5'), {
            status: 400,
            message: 'Only one coupon can be applied per order',
        });
    });

    test('rejects an unknown code', () => {
        cart.addItem('alice', 'P002', 1);
        assert.throws(() => cart.applyCoupon('alice', 'BADCODE'), {
            status: 400,
            message: 'Invalid coupon code',
        });
    });

    test('rejects an expired code', () => {
        cart.addItem('alice', 'P002', 1);
        assert.throws(() => cart.applyCoupon('alice', 'EXPIRED20'), {
            status: 400,
            message: 'This coupon has expired',
        });
    });

    test('rejects a coupon on an empty cart', () => {
        assert.throws(() => cart.applyCoupon('alice', 'SAVE10'), {
            status: 400,
            message: 'Cart is empty',
        });
    });

    test('FLAT5 requires a $30.00 subtotal', () => {
        cart.addItem('alice', 'P001', 1);
        assert.throws(() => cart.applyCoupon('alice', 'FLAT5'), {
            status: 400,
            message: 'This coupon requires a subtotal of at least $30.00',
        });
    });

    test('removing the coupon restores the full price', () => {
        cart.addItem('alice', 'P002', 1);
        cart.applyCoupon('alice', 'SAVE10');
        const result = cart.removeCoupon('alice');
        assert.equal(result.couponCode, null);
        assert.equal(result.discountCents, 0);
        assert.equal(result.totalCents, 5499);
    });

    test('coupon stays applied after the subtotal drops below its minimum (RQ-04)', () => {
        cart.addItem('alice', 'P001', 1);
        cart.addItem('alice', 'P004', 1);
        cart.applyCoupon('alice', 'FLAT5');
        const result = cart.removeItem('alice', 'P004');
        assert.equal(result.couponCode, 'FLAT5');
        assert.equal(result.discountCents, 0);
    });
});