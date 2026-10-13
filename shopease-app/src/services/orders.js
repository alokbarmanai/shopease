// Checkout and order rules from BRD BR-05, BR-06, BR-07 (RULE-10 to RULE-13).

const { getData } = require('../data/store');
const cart = require('./cart');
const AppError = require('./AppError');

// RULE-12: all shipping fields are mandatory.
const SHIPPING_FIELDS = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'zipCode', label: 'ZIP Code' },
    { key: 'phone', label: 'Phone' },
];

function validateShipping(input = {}) {
    const shipping = {};

    for (const { key, label } of SHIPPING_FIELDS) {
        const value = String(input[key] ?? '').trim();
        if (!value) throw new AppError(400, `${label} is required`);
        shipping[key] = value;
    }

    if (!/^\d{5}$/.test(shipping.zipCode)) {
        throw new AppError(400, 'ZIP Code must be exactly 5 digits'); // RULE-10
    }
    if (!/^\d{10}$/.test(shipping.phone)) {
        throw new AppError(400, 'Phone must be exactly 10 digits'); // RULE-11
    }

    return shipping;
}

// RULE-13: "SE-" followed by 6 digits, never repeated.
function generateOrderId() {
    const existingIds = new Set(getData().orders.map((o) => o.orderId));
    let id;
    do {
        id = `SE-${Math.floor(100000 + Math.random() * 900000)}`;
    } while (existingIds.has(id));
    return id;
}

function placeOrder(username, shippingInput) {
    const currentCart = cart.getCart(username);
    if (currentCart.items.length === 0) {
        throw new AppError(400, 'Cart is empty'); // BR-05
    }

    const shipping = validateShipping(shippingInput);

    // Check stock AGAIN: another customer may have bought the items
    // after they were added to this cart.
    const products = getData().products;
    for (const item of currentCart.items) {
        const product = products.find((p) => p.id === item.productId);
        if (item.quantity > product.stock) {
            throw new AppError(400, `Only ${product.stock} left in stock for ${product.name}`);
        }
    }

    // BR-06: reduce stock, save the order, empty the cart.
    for (const item of currentCart.items) {
        products.find((p) => p.id === item.productId).stock -= item.quantity;
    }

    const order = {
        orderId: generateOrderId(),
        username,
        createdAt: new Date().toISOString(),
        paymentMethod: 'Cash on Delivery', // BRD §10: no real payment
        shipping,
        ...currentCart, // items, itemCount, couponCode, and all totals
    };

    getData().orders.push(order);
    cart.clearCart(username);
    return order;
}

// BR-07: the customer's own orders, newest first.
function listOrders(username) {
    return getData()
        .orders.filter((o) => o.username === username)
        .reverse()
        .map((o) => ({
            orderId: o.orderId,
            createdAt: o.createdAt,
            itemCount: o.itemCount,
            totalCents: o.totalCents,
        }));
}

module.exports = { placeOrder, listOrders };