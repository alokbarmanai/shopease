// Reference data from BRD §8 (SE-BRD-001).
// Money is stored in CENTS (integers) to avoid floating-point rounding errors.
// e.g. $19.99 is stored as 1999.

function createSeedData() {
    return {
        users: [
            // NOTE: Plain-text passwords are for DEMO ONLY.
            // Production systems store a secure hash (e.g. bcrypt), never the password.
            { username: 'alice', password: 'Shop@123', fullName: 'Alice Johnson', locked: false },
            { username: 'bob', password: 'Shop@123', fullName: 'Bob Smith', locked: false },
            { username: 'locked_user', password: 'Shop@123', fullName: 'Locked User', locked: true },
        ],

        products: [
            { id: 'P001', name: 'Wireless Mouse', category: 'Accessories', priceCents: 1999, stock: 25 },
            { id: 'P002', name: 'Mechanical Keyboard', category: 'Peripherals', priceCents: 4999, stock: 10 },
            { id: 'P003', name: 'USB-C Hub', category: 'Accessories', priceCents: 2999, stock: 2 },
            { id: 'P004', name: 'Laptop Stand', category: 'Accessories', priceCents: 3450, stock: 15 },
            { id: 'P005', name: 'Noise-Cancelling Headphones', category: 'Audio', priceCents: 8900, stock: 5 },
            { id: 'P006', name: 'HD Webcam', category: 'Peripherals', priceCents: 3999, stock: 0 },
        ],

        // BRD §7.1
        coupons: [
            { code: 'SAVE10', type: 'PERCENT', value: 10, minSubtotalCents: 0, active: true },
            { code: 'FLAT5', type: 'FIXED', value: 500, minSubtotalCents: 3000, active: true },
            { code: 'EXPIRED20', type: 'PERCENT', value: 20, minSubtotalCents: 0, active: false },
        ],

        carts: {},    // username -> { items: [{ productId, quantity }], couponCode: null }
        orders: [],   // placed orders
        sessions: {}, // token -> username
    };
}

module.exports = { createSeedData };