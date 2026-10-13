// Cart endpoints (BR-03). See ARCHITECTURE.md §3.

const express = require('express');
const cart = require('../services/cart');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Every cart endpoint requires login.
router.use(requireAuth);

// GET /api/cart
router.get('/', (req, res) => {
    res.json(cart.getCart(req.username));
});

// POST /api/cart/items   body: { "productId": "P001", "quantity": 2 }
router.post('/items', (req, res) => {
    const { productId, quantity } = req.body || {};
    res.json(cart.addItem(req.username, productId, quantity));
});

// PATCH /api/cart/items/:productId   body: { "quantity": 3 }
router.patch('/items/:productId', (req, res) => {
    const { quantity } = req.body || {};
    res.json(cart.updateQuantity(req.username, req.params.productId, quantity));
});

// DELETE /api/cart/items/:productId
router.delete('/items/:productId', (req, res) => {
    res.json(cart.removeItem(req.username, req.params.productId));
});

// POST /api/cart/coupon   body: { "code": "SAVE10" }
router.post('/coupon', (req, res) => {
    const { code } = req.body || {};
    res.json(cart.applyCoupon(req.username, code));
});

// DELETE /api/cart/coupon
router.delete('/coupon', (req, res) => {
    res.json(cart.removeCoupon(req.username));
});

module.exports = router;