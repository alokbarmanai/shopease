// Cart page (BR-03, BR-04 · RULE-01, RULE-02, RULE-04 to RULE-09).

if (requireLogin()) {
    initCartPage();
}

async function initCartPage() {
    await renderHeader();
    renderCart(await api('GET', '/cart'));

    document.getElementById('coupon-form').addEventListener('submit', applyCoupon);
    document
        .querySelector('[data-testid="remove-coupon-button"]')
        .addEventListener('click', removeCoupon);
}

// The page always shows exactly what the server returned.
function renderCart(cart) {
    const isEmpty = cart.items.length === 0;
    document.querySelector('[data-testid="cart-empty"]').hidden = !isEmpty;
    document.querySelector('[data-testid="cart-content"]').hidden = isEmpty;
    document.querySelector('[data-testid="cart-badge"]').textContent = cart.itemCount;

    document
        .querySelector('[data-testid="cart-items"]')
        .replaceChildren(...cart.items.map(createCartRow));

    // Coupon: show the input OR the applied coupon, never both (RULE-04).
    const couponForm = document.getElementById('coupon-form');
    const hasCoupon = Boolean(cart.couponCode);
    couponForm.hidden = hasCoupon;
    if (hasCoupon) couponForm.code.value = '';
    document.querySelector('[data-testid="applied-coupon-box"]').hidden = !hasCoupon;
    setText('applied-coupon', cart.couponCode ?? '');

    // Summary (RULE-06 to RULE-09).
    setText('summary-subtotal', formatMoney(cart.subtotalCents));
    setText('summary-discount',
        cart.discountCents > 0 ? `-${formatMoney(cart.discountCents)}` : formatMoney(0));
    setText('summary-shipping',
        cart.shippingCents === 0 ? 'FREE' : formatMoney(cart.shippingCents));
    setText('summary-total', formatMoney(cart.totalCents));
}

function createCartRow(item) {
    const row = document.createElement('tr');
    row.dataset.testid = `cart-row-${item.productId}`;
    row.innerHTML = `
    <td data-testid="item-name"></td>
    <td data-testid="item-price"></td>
    <td><input type="number" min="1" max="5"></td>
    <td class="text-right" data-testid="item-line-total"></td>
    <td class="text-right"><button type="button" class="link-button">Remove</button></td>
  `;

    row.querySelector('[data-testid="item-name"]').textContent = item.name;
    row.querySelector('[data-testid="item-price"]').textContent = formatMoney(item.priceCents);
    row.querySelector('[data-testid="item-line-total"]').textContent =
        formatMoney(item.lineTotalCents);

    const quantityInput = row.querySelector('input');
    quantityInput.value = item.quantity;
    quantityInput.dataset.testid = `quantity-input-${item.productId}`;
    quantityInput.setAttribute('aria-label', `Quantity for ${item.name}`);
    quantityInput.addEventListener('change', () =>
        updateQuantity(item.productId, quantityInput.value));

    const removeButton = row.querySelector('button');
    removeButton.dataset.testid = `remove-item-${item.productId}`;
    removeButton.addEventListener('click', () => removeItem(item.productId));

    return row;
}

// Runs one cart change, then redraws the page from the server's answer.
// On error: show the message and redraw the REAL cart (undoes bad input).
async function updateCart(action, successText) {
    hideMessage();
    try {
        renderCart(await action());
        if (successText) showMessage('success', successText);
    } catch (error) {
        showMessage('error', error.message);
        renderCart(await api('GET', '/cart'));
    }
}

function updateQuantity(productId, value) {
    updateCart(() => api('PATCH', `/cart/items/${productId}`, { quantity: Number(value) }));
}

function removeItem(productId) {
    updateCart(() => api('DELETE', `/cart/items/${productId}`), 'Item removed from cart');
}

function applyCoupon(event) {
    event.preventDefault();
    const code = event.target.code.value;
    updateCart(() => api('POST', '/cart/coupon', { code }), 'Coupon applied');
}

function removeCoupon() {
    updateCart(() => api('DELETE', '/cart/coupon'), 'Coupon removed');
}

function setText(testId, text) {
    document.querySelector(`[data-testid="${testId}"]`).textContent = text;
}
