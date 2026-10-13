// Order confirmation page (BR-06 · RULE-13).

if (requireLogin()) {
    initConfirmationPage();
}

async function initConfirmationPage() {
    await renderHeader();

    // The order ID comes from the URL: /confirmation.html?orderId=SE-123456
    const orderId = new URLSearchParams(window.location.search).get('orderId');

    // The API only returns the logged-in customer's OWN orders,
    // so another customer's order ID is simply "not found".
    const orders = await api('GET', '/orders');
    const order = orders.find((o) => o.orderId === orderId);

    if (!order) {
        document.querySelector('[data-testid="confirmation-not-found"]').hidden = false;
        return;
    }

    // Everything shown comes from the server's order, not from the URL.
    setText('order-id', order.orderId);
    setText('order-date', formatDate(order.createdAt));
    setText('order-item-count', String(order.itemCount));
    setText('order-total', formatMoney(order.totalCents));
    document.querySelector('[data-testid="confirmation-content"]').hidden = false;
}