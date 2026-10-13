// Order history page (BR-07: newest first).

if (requireLogin()) {
    initOrdersPage();
}

async function initOrdersPage() {
    await renderHeader();

    // The server already returns newest first (BR-07), so no sorting here.
    const orders = await api('GET', '/orders');

    document.querySelector('[data-testid="orders-empty"]').hidden = orders.length > 0;
    document.querySelector('[data-testid="orders-table"]').hidden = orders.length === 0;
    document
        .querySelector('[data-testid="orders-list"]')
        .replaceChildren(...orders.map(createOrderRow));
}

function createOrderRow(order) {
    const row = document.createElement('tr');
    row.dataset.testid = `order-row-${order.orderId}`;
    row.innerHTML = `
    <td data-testid="order-id"></td>
    <td data-testid="order-date"></td>
    <td data-testid="order-items"></td>
    <td class="text-right" data-testid="order-total"></td>
  `;

    row.querySelector('[data-testid="order-id"]').textContent = order.orderId;
    row.querySelector('[data-testid="order-date"]').textContent = formatDate(order.createdAt);
    row.querySelector('[data-testid="order-items"]').textContent = String(order.itemCount);
    row.querySelector('[data-testid="order-total"]').textContent = formatMoney(order.totalCents);
    return row;
}