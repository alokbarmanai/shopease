// Unit tests for the pricing rules (BRD RULE-06 to RULE-08).
// Run with: npm test

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateTotals } = require('../../src/services/pricing');

const SAVE10 = { type: 'PERCENT', value: 10, minSubtotalCents: 0 };
const FLAT5 = { type: 'FIXED', value: 500, minSubtotalCents: 3000 };

// One cart line: price in cents and quantity.
const line = (priceCents, quantity = 1) => ({ priceCents, quantity });

describe('subtotal and total (RULE-08)', () => {
    test('empty cart has all totals at zero (RQ-02)', () => {
        assert.deepEqual(calculateTotals([], null), {
            subtotalCents: 0,
            discountCents: 0,
            shippingCents: 0,
            totalCents: 0,
        });
    });

    test('subtotal is the sum of price x quantity', () => {
        const totals = calculateTotals([line(1999, 2), line(3450)], null);
        assert.equal(totals.subtotalCents, 7448);
    });
});

describe('shipping (RULE-07)', () => {
    test('$49.99 pays $5.00 shipping', () => {
        assert.equal(calculateTotals([line(4999)], null).shippingCents, 500);
    });

    test('exactly $50.00 ships free (boundary)', () => {
        assert.equal(calculateTotals([line(5000)], null).shippingCents, 0);
    });
});

describe('coupon SAVE10 (RULE-06)', () => {
    test('10% is rounded to the nearest cent (RQ-01)', () => {
        assert.deepEqual(calculateTotals([line(4999)], SAVE10), {
            subtotalCents: 4999,
            discountCents: 500,
            shippingCents: 500,
            totalCents: 4999,
        });
    });
});

describe('coupon FLAT5 (BRD 7.1)', () => {
    test('gives no discount below the $30.00 minimum', () => {
        assert.equal(calculateTotals([line(2999)], FLAT5).discountCents, 0);
    });

    test('gives $5.00 at exactly $30.00 (boundary)', () => {
        assert.equal(calculateTotals([line(3000)], FLAT5).discountCents, 500);
    });

    test('can leave the total unchanged (RQ-03)', () => {
        const cart = [line(1999), line(3450)];
        assert.equal(
            calculateTotals(cart, FLAT5).totalCents,
            calculateTotals(cart, null).totalCents,
        );
    });
});

describe('discount limit', () => {
    test('discount never exceeds the subtotal', () => {
        const bigCoupon = { type: 'FIXED', value: 500, minSubtotalCents: 0 };
        assert.equal(calculateTotals([line(300)], bigCoupon).discountCents, 300);
    });
});