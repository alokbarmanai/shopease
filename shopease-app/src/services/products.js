// Product catalog rules from BRD BR-02.

const { getData } = require('../data/store');

function listProducts({ search, category } = {}) {
    let products = getData().products;

    // Search by name: partial match, case-insensitive (BR-02).
    if (search) {
        const term = search.trim().toLowerCase();
        products = products.filter((p) => p.name.toLowerCase().includes(term));
    }

    // Filter by category (case-insensitive).
    if (category) {
        products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    return products.map(toProductView);
}

// What the API returns for each product.
function toProductView(p) {
    return {
        id: p.id,
        name: p.name,
        category: p.category,
        priceCents: p.priceCents,
        stock: p.stock,
        inStock: p.stock > 0, // RULE-03: stock 0 = Out of Stock
    };
}

module.exports = { listProducts };