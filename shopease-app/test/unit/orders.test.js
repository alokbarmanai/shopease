// Unit tests for checkout and order rules (BRD BR-05 to BR-07, RULE-10 to RULE-13).

const { describe, test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const cart = require('../../src/services/cart');
const orders = require('../../src/services/orders');
const { getData, resetData } = require('../../src/data/store');

// Every test starts from fresh seed data (test isolation).
beforeEach(() => {
    resetData();
});

// A valid shipping address; tests override one field at a time.
function shipping(overrides = {}) {
    return {
        fullName: 'Alice Johnson',
        address: '1 Main St',
        city: 'Austin',
        zipCode: '73301',
        phone: '5125550100',
        ...overrides,
    };
}

function stockOf(productId) {
    return getData().products.find((p) => p.id === productId).stock;
}

describe('placeOrder: validation (BR-05, RULE-10 to RULE-12)', () => {
    test('rejects an empty cart', () => {
        assert.throws(() => orders.placeOrder('alice', shipping()), {
            status: 400,
            message: 'Cart is empty',
        });
    });

    const fields = [
        ['fullName', 'Full Name'],
        ['address', 'Address'],
        ['city', 'City'],
        ['zipCode', 'ZIP Code'],
        ['phone', 'Phone'],
    ];
    for (const [key, label] of fields) {
        test(`requires ${label} (spaces only is not enough)`, () => {
            cart.addItem('alice', 'P001', 1);
            assert.throws(() => orders.placeOrder('alice', shipping({ [key]: '   ' })), {
                status: 400,
                message: `${label} is required`,
            });
        });
    }

    for (const zipCode of ['1234', '123456', '7330a']) {
        test(`rejects ZIP Code "${zipCode}"`, () => {
            cart.addItem('alice', 'P001', 1);
            assert.throws(() => orders.placeOrder('alice', shipping({ zipCode })), {
                status: 400,
                message: 'ZIP Code must be exactly 5 digits',
            });
        });
    }

    for (const phone of ['12345', '512-555-0100', '51255501001']) {
        test(`rejects phone "${phone}"`, () => {
            cart.addItem('alice', 'P001', 1);
            assert.throws(() => orders.placeOrder('alice', shipping({ phone })), {
                status: 400,
                message: 'Phone must be exactly 10 digits',
            });
        });
    }
});

describe('placeOrder: success (BR-06, RULE-13)', () => {
    test('creates an order with an SE- ID and the cart totals', () => {
        cart.addItem('alice', 'P002', 1);
        const order = orders.placeOrder('alice', shipping());
        assert.match(order.orderId, /^SE-\d{6}$/);
        assert.equal(order.paymentMethod, 'Cash on Delivery');
        assert.equal(order.itemCount, 1);
        assert.equal(order.totalCents, 5499);
    });

    test('reduces stock and empties the cart', () => {
        cart.addItem('alice', 'P002', 1);
        orders.placeOrder('alice', shipping());
        assert.equal(stockOf('P002'), 9);
        assert.equal(cart.getCart('alice').items.length, 0);
    });

    test('saves trimmed shipping details', () => {
        cart.addItem('alice', 'P002', 1);
        const order = orders.placeOrder('alice', shipping({ city: '  Austin  ' }));
        assert.equal(order.shipping.city, 'Austin');
    });

    test('gives every order a different ID', () => {
        cart.addItem('alice', 'P001', 1);
        const first = orders.placeOrder('alice', shipping());
        cart.addItem('alice', 'P001', 1);
        const second = orders.placeOrder('alice', shipping());
        assert.notEqual(first.orderId, second.orderId);
    });
});

describe('placeOrder: a rejected order changes nothing', () => {
    test('stock, cart and order history stay the same', () => {
        cart.addItem('alice', 'P002', 1);
        assert.throws(() => orders.placeOrder('alice', shipping({ zipCode: '1234' })));
        assert.equal(stockOf('P002'), 10);
        assert.equal(cart.getCart('alice').items.length, 1);
        assert.equal(orders.listOrders('alice').length, 0);
    });
});

describe('stock re-check at checkout (race condition)', () => {
    test('the second customer cannot buy items that were just sold', () => {
        cart.addItem('alice', 'P003', 2);
        cart.addItem('bob', 'P003', 2); // adding to a cart does not reserve stock
        orders.placeOrder('bob', shipping({ fullName: 'Bob Smith' }));

        assert.throws(() => orders.placeOrder('alice', shipping()), {
            status: 400,
            message: 'Only 0 left in stock for USB-C Hub',
        });
        assert.equal(stockOf('P003'), 0); // never negative
        assert.equal(cart.getCart('alice').items.length, 1); // alice's cart is kept
    });
});

describe('listOrders (BR-07)', () => {
    test('returns the newest order first', () => {
        cart.addItem('alice', 'P002', 1);
        orders.placeOrder('alice', shipping());
        cart.addItem('alice', 'P001', 1);
        orders.placeOrder('alice', shipping());

        const list = orders.listOrders('alice');
        assert.equal(list[0].totalCents, 2499);
        assert.equal(list[1].totalCents, 5499);
    });

    test('returns only the customer\'s own orders', () => {
        cart.addItem('alice', 'P002', 1);
        orders.placeOrder('alice', shipping());
        assert.equal(orders.listOrders('bob').length, 0);
    });

    test('returns summary fields only (no shipping address)', () => {
        cart.addItem('alice', 'P002', 1);
        orders.placeOrder('alice', shipping());
        assert.deepEqual(Object.keys(orders.listOrders('alice')[0]), [
            'orderId',
            'createdAt',
            'itemCount',
            'totalCents',
        ]);
    });
});