// Test-support endpoints for automated tests (ARCHITECTURE.md §4).
// NEVER available in production – see server.js.

const express = require('express');
const { resetData } = require('../data/store');

const router = express.Router();

// POST /api/test/reset – restore seed data (BRD §8).
// Clears carts, orders and sessions, and restores stock.
router.post('/reset', (req, res) => {
    resetData();
    res.json({ message: 'Test data reset' });
});

module.exports = router;