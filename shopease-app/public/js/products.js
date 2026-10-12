// Products page (BR-02, BR-03, RULE-03).

if (requireLogin()) {
    initProductsPage();
}

async function initProductsPage() {
    await renderHeader();

    // Build the category dropdown from the full product list.
    const allProducts = await api('GET', '/products');
    const categorySelect = document.querySelector('[data-testid="category-filter"]');
    const categories = [...new Set(allProducts.map((p) => p.category))].sort();
    for (const category of categories) {
        categorySelect.add(new Option(category, category));
    }
    renderProducts(allProducts);

    document.querySelector('[data-testid="search-input"]').addEventListener('input', loadProducts);
    categorySelect.addEventListener('change', loadProducts);
}

// Only the response to the LATEST search is shown (see note in the lesson).
let latestRequestId = 0;

async function loadProducts() {
    const search = document.querySelector('[data-testid="search-input"]').value;
    const category = document.querySelector('[data-testid="category-filter"]').value;

    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (category) query.set('category', category);

    const requestId = ++latestRequestId;
    const products = await api('GET', `/products?${query}`);
    if (requestId === latestRequestId) {
        renderProducts(products);
    }
}

function renderProducts(products) {
    const grid = document.querySelector('[data-testid="product-grid"]');
    document.querySelector('[data-testid="no-products"]').hidden = products.length > 0;
    grid.replaceChildren(...products.map(createProductCard));
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'card product-card';
    card.dataset.testid = `product-card-${product.id}`;
    card.innerHTML = `
    <h3 data-testid="product-name"></h3>
    <p class="muted" data-testid="product-category"></p>
    <p class="price" data-testid="product-price"></p>
    <p data-testid="product-stock"></p>
    <button type="button">Add to Cart</button>
  `;

    // Data goes in with textContent, never innerHTML (XSS safety).
    card.querySelector('[data-testid="product-name"]').textContent = product.name;
    card.querySelector('[data-testid="product-category"]').textContent = product.category;
    card.querySelector('[data-testid="product-price"]').textContent = formatMoney(product.priceCents);

    const stock = card.querySelector('[data-testid="product-stock"]');
    const button = card.querySelector('button');
    button.dataset.testid = `add-to-cart-${product.id}`;

    if (product.inStock) {
        stock.textContent = `In stock: ${product.stock}`;
    } else {
        stock.textContent = 'Out of Stock'; // RULE-03
        stock.classList.add('out-of-stock');
        button.disabled = true;
    }

    button.addEventListener('click', () => addToCart(product));
    return card;
}

async function addToCart(product) {
    try {
        await api('POST', '/cart/items', { productId: product.id, quantity: 1 });
        showMessage('success', `${product.name} added to cart`);
        await refreshCartBadge();
    } catch (error) {
        showMessage('error', error.message);
    }
}

function showMessage(type, text) {
    const box = document.querySelector('[data-testid="page-message"]');
    box.className = `message ${type}`;
    box.textContent = text;
    box.hidden = false;
}