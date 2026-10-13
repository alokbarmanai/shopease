// Auth endpoints (BR-01). See ARCHITECTURE.md §3.

const express = require('express');
const auth = require('../services/auth');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// POST /api/auth/login   body: { "username": "...", "password": "..." }
router.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    const result = auth.login(username, password);
    res.json(result);
});

// POST /api/auth/logout  (requires login)
router.post('/logout', requireAuth, (req, res) => {
    auth.logout(req.token);
    res.json({ message: 'Logged out' });
});

module.exports = router;