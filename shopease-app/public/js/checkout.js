// Checkout page (BR-05 · RULE-10 to RULE-12).

if (requireLogin()) {
    initCheckoutPage();
}

async function initCheckoutPage() {
    await renderHeader();
    const cart = await api('GET', '/cart');

    // BR-05: no checkout with an empty cart.
    const isEmpty = cart.items.length === 0;
    document.querySelector('[data-testid="checkout-empty"]').hidden = !isEmpty;
    document.querySelector('[data-testid="checkout-content"]').hidden = isEmpty;
    if (isEmpty) return;

    renderSummaryItems(cart.items);
    renderTotals(cart);
    document.getElementById('checkout-form').addEventListener('submit', placeOrder);
}

function renderSummaryItems(items) {
    const list = document.querySelector('[data-testid="summary-items"]');
    list.replaceChildren(...items.map((item) => {
        const li = document.createElement('li');
        li.dataset.testid = `summary-item-${item.productId}`;

        const name = document.createElement('span');
        name.textContent = `${item.name} × ${item.quantity}`;
        const lineTotal = document.createElement('span');
        lineTotal.textContent = formatMoney(item.lineTotalCents);

        li.append(name, lineTotal);
        return li;
    }));
}

async function placeOrder(event) {
    event.preventDefault();
    hideMessage();

    const button = document.querySelector('[data-testid="place-order-button"]');
    button.disabled = true; // a double-click must NEVER create two orders

    try {
        // Form field names = API keys, so the form becomes the request body directly.
        const shipping = Object.fromEntries(new FormData(event.target));
        const order = await api('POST', '/orders', { shipping });
        window.location.href = `/confirmation.html?orderId=${encodeURIComponent(order.orderId)}`;
    } catch (error) {
        showMessage('error', error.message);
        button.disabled = false;
    }
}