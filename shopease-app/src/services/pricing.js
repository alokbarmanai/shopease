// Pricing rules from BRD §7 (RULE-06 to RULE-08).
// All amounts are in cents.

const FREE_SHIPPING_THRESHOLD_CENTS = 6000; // RULE-07: $50.00
const SHIPPING_FEE_CENTS = 500;             // RULE-07: $5.00

function calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

// RULE-06: discount is calculated on the subtotal.
function calculateDiscount(subtotalCents, coupon) {
    if (!coupon || subtotalCents < coupon.minSubtotalCents) return 0;

    const discountCents = coupon.type === 'PERCENT'
        ? Math.round((subtotalCents * coupon.value) / 100)
        : coupon.value;

    return Math.min(discountCents, subtotalCents); // never more than the subtotal
}

// RULE-07: free shipping when (subtotal - discount) >= $50.00, otherwise $5.00.
function calculateShipping(subtotalCents, discountCents) {
    if (subtotalCents === 0) return 0; // empty cart: nothing to ship
    return subtotalCents - discountCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FEE_CENTS;
}

// RULE-08: Total = Subtotal - Discount + Shipping.
function calculateTotals(items, coupon) {
    const subtotalCents = calculateSubtotal(items);
    const discountCents = calculateDiscount(subtotalCents, coupon);
    const shippingCents = calculateShipping(subtotalCents, discountCents);

    return {
        subtotalCents,
        discountCents,
        shippingCents,
        totalCents: subtotalCents - discountCents + shippingCents,
    };
}

module.exports = { calculateTotals, FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_FEE_CENTS };