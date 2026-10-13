// "Door security": blocks requests without a valid login token (ARCHITECTURE.md §2).

const { getUsernameForToken } = require('../services/auth');

function requireAuth(req, res, next) {
    // Expected header format:  Authorization: Bearer <token>
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const username = token ? getUsernameForToken(token) : null;

    if (!username) {
        return res.status(401).json({ error: 'Please log in to continue' });
    }

    // Let the route know who is calling.
    req.username = username;
    req.token = token;
    next();
}

module.exports = requireAuth;