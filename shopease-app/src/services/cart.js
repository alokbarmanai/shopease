// Shopping cart rules from BRD BR-03 (RULE-01 to RULE-03).

const { getData } = require('../data/store');
const { calculateTotals } = require('./pricing');
const AppError = require('./AppError');

const MAX_QTY_PER_PRODUCT = 5; // RULE-01

// Each user has one cart; it is created the first time it's needed.
function getOrCreateCart(username) {
    const carts = getData().carts;
    if (!carts[username]) {
        carts[username] = { items: [], couponCode: null };
    }
    return carts[username];
}

function findProduct(productId) {
    const product = getData().products.find((p) => p.id === productId);
    if (!product) throw new AppError(404, 'Product not found');
    return product;
}

// RULE-01 and RULE-02
function validateQuantity(quantity, product) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_PRODUCT) {
        throw new AppError(400, `Quantity must be between 1 and ${MAX_QTY_PER_PRODUCT}`);
    }
    if (quantity > product.stock) {
        throw new AppError(400, `Only ${product.stock} left in stock`);
    }
}

function addItem(username, productId, quantity) {
    const product = findProduct(productId);
    if (product.stock === 0) {
        throw new AppError(400, 'Product is out of stock'); // RULE-03
    }

    const cart = getOrCreateCart(username);
    const existing = cart.items.find((i) => i.productId === productId);
    const newQuantity = (existing ? existing.quantity : 0) + quantity;

    validateQuantity(quantity, product);    // the amount being added
    validateQuantity(newQuantity, product); // the total for this product in the cart

    if (existing) {
        existing.quantity = newQuantity;
    } else {
        cart.items.push({ productId, quantity });
    }
    return getCart(username);
}

function updateQuantity(username, productId, quantity) {
    const cart = getOrCreateCart(username);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) throw new AppError(404, 'Product is not in the cart');

    validateQuantity(quantity, findProduct(productId));
    item.quantity = quantity;
    return getCart(username);
}

function removeItem(username, productId) {
    const cart = getOrCreateCart(username);
    const countBefore = cart.items.length;
    cart.items = cart.items.filter((i) => i.productId !== productId);
    if (cart.items.length === countBefore) throw new AppError(404, 'Product is not in the cart');
    return getCart(username);
}

// The cart as the API returns it: items with names and prices, plus totals.
function getCart(username) {
    const cart = getOrCreateCart(username);

    const items = cart.items.map((i) => {
        const product = findProduct(i.productId);
        return {
            productId: product.id,
            name: product.name,
            priceCents: product.priceCents,
            quantity: i.quantity,
            lineTotalCents: product.priceCents * i.quantity,
        };
    });

    const coupon = cart.couponCode
        ? getData().coupons.find((c) => c.code === cart.couponCode)
        : null;

    return {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0), // header cart badge (BR-03)
        couponCode: cart.couponCode,
        ...calculateTotals(items, coupon),
    };
}
// BR-04: apply one coupon to the cart (RULE-04, RULE-05, BRD §7.1).
function applyCoupon(username, code) {
    const cart = getOrCreateCart(username);

    if (cart.items.length === 0) {
        throw new AppError(400, 'Cart is empty');
    }
    if (cart.couponCode) {
        throw new AppError(400, 'Only one coupon can be applied per order'); // RULE-04
    }

    // RULE-05: not case-sensitive (codes are stored in upper case).
    const normalizedCode = String(code || '').trim().toUpperCase();
    const coupon = getData().coupons.find((c) => c.code === normalizedCode);

    if (!coupon) {
        throw new AppError(400, 'Invalid coupon code');
    }
    if (!coupon.active) {
        throw new AppError(400, 'This coupon has expired');
    }

    const { subtotalCents } = getCart(username);
    if (subtotalCents < coupon.minSubtotalCents) {
        const minimum = (coupon.minSubtotalCents / 100).toFixed(2);
        throw new AppError(400, `This coupon requires a subtotal of at least $${minimum}`);
    }

    cart.couponCode = coupon.code;
    return getCart(username);
}

// BR-04: remove the applied coupon.
function removeCoupon(username) {
    getOrCreateCart(username).couponCode = null;
    return getCart(username);
}

// Empty the cart after an order is placed (BR-06).
function clearCart(username) {
    getData().carts[username] = { items: [], couponCode: null };
}

module.exports = {
    getCart,
    addItem,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    clearCart,
};