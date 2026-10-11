// Product endpoints (BR-02). See ARCHITECTURE.md §3.

const express = require('express');
const products = require('../services/products');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// GET /api/products?search=mouse&category=Accessories   (requires login)
router.get('/', requireAuth, (req, res) => {
    const { search, category } = req.query;
    res.json(products.listProducts({ search, category }));
});

module.exports = router;