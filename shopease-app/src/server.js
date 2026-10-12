// ShopEase server – entry point.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Read JSON request bodies (e.g. login form data).
app.use(express.json());

// Serve frontend files (HTML, CSS, JS) from the /public folder.
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check: monitoring tools and our test suite call this
// to confirm the app is up before doing anything else.
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// NEW: API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));

// NEW: Error handler – turns any error into { "error": "..." } (ARCHITECTURE.md §3).
// Must be registered AFTER all routes.
app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message });
});

app.listen(PORT, () => {
    console.log(`ShopEase running at http://localhost:${PORT}`);
});