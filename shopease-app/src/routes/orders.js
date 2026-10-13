// Order endpoints (BR-05, BR-06, BR-07). See ARCHITECTURE.md §3.

const express = require('express');
const orders = require('../services/orders');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Every order endpoint requires login.
router.use(requireAuth);

// POST /api/orders
// body: { "shipping": { "fullName", "address", "city", "zipCode", "phone" } }
router.post('/', (req, res) => {
    const { shipping } = req.body || {};
    res.status(201).json(orders.placeOrder(req.username, shipping));
});

// GET /api/orders
router.get('/', (req, res) => {
    res.json(orders.listOrders(req.username));
});

module.exports = router;