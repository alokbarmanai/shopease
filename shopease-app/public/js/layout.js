// Shared page layout: login check and the header
// (user name, navigation, cart badge, logout).

// Pages that need a logged-in user call this first.
function requireLogin() {
    if (!auth.token()) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

async function renderHeader() {
    const header = document.getElementById('app-header');
    header.innerHTML = `
    <a href="/products.html" class="logo" data-testid="nav-logo">ShopEase</a>
    <nav>
      <a href="/products.html" data-testid="nav-products">Products</a>
      <a href="/orders.html" data-testid="nav-orders">My Orders</a>
      <a href="/cart.html" data-testid="nav-cart">
        Cart <span class="badge" data-testid="cart-badge">0</span>
      </a>
      <span class="user" data-testid="nav-user"></span>
      <button type="button" class="link-button" data-testid="logout-button">Logout</button>
    </nav>
  `;

    // textContent (not innerHTML) so a name can never inject HTML.
    header.querySelector('[data-testid="nav-user"]').textContent =
        `Hi, ${auth.user()?.fullName ?? ''}`;
    header.querySelector('[data-testid="logout-button"]').addEventListener('click', logout);

    await refreshCartBadge();
}

// BR-03: the header badge shows the total number of items in the cart.
async function refreshCartBadge() {
    const cart = await api('GET', '/cart');
    document.querySelector('[data-testid="cart-badge"]').textContent = cart.itemCount;
}

async function logout() {
    try {
        await api('POST', '/auth/logout');
    } finally {
        auth.clear();
        window.location.href = '/index.html';
    }
}


// Page message box (success / error) for pages that have
// <div data-testid="page-message">.
function showMessage(type, text) {
    const box = document.querySelector('[data-testid="page-message"]');
    box.className = `message ${type}`;
    box.textContent = text;
    box.hidden = false;
}

function hideMessage() {
    document.querySelector('[data-testid="page-message"]').hidden = true;
}

// Sets the text of the element with the given data-testid.
function setText(testId, text) {
    document.querySelector(`[data-testid="${testId}"]`).textContent = text;
}

// Order totals block used on the cart and checkout pages (RULE-06 to RULE-09).
function renderTotals(cart) {
    setText('summary-subtotal', formatMoney(cart.subtotalCents));
    setText('summary-discount',
        cart.discountCents > 0 ? `-${formatMoney(cart.discountCents)}` : formatMoney(0));
    setText('summary-shipping',
        cart.shippingCents === 0 ? 'FREE' : formatMoney(cart.shippingCents));
    setText('summary-total', formatMoney(cart.totalCents));
}
