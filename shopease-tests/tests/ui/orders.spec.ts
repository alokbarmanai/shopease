import { test, expect } from '../../fixtures';
import { OrdersPage } from '../../pages/OrdersPage';
import { ConfirmationPage } from '../../pages/ConfirmationPage';
import { LoginPage } from '../../pages/LoginPage';
import { PRODUCTS } from '../../test-data/products';
import { USERS } from '../../test-data/users';
import { VALID_SHIPPING } from '../../test-data/shipping';

test.describe('Order history and confirmation (BR-06, BR-07)', { tag: '@ui' }, () => {
    test('a new customer has no orders', async ({ alicePage }) => {
        const ordersPage = new OrdersPage(alicePage);
        await ordersPage.goto();

        await expect(ordersPage.emptyState).toBeVisible();
    });

    test('orders are listed newest first', async ({ aliceApi, alicePage }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        const first = await (await aliceApi.placeOrder(VALID_SHIPPING)).json();
        await aliceApi.addItem(PRODUCTS.mouse.id, 1);
        const second = await (await aliceApi.placeOrder(VALID_SHIPPING)).json();

        const ordersPage = new OrdersPage(alicePage);
        await ordersPage.goto();

        await expect(ordersPage.rows).toHaveCount(2);
        await expect(ordersPage.rows.nth(0).getByTestId('order-id')).toHaveText(second.orderId);
        await expect(ordersPage.rows.nth(1).getByTestId('order-id')).toHaveText(first.orderId);
        await expect(ordersPage.rows.nth(0).getByTestId('order-total')).toHaveText('$24.99');
    });

    test('another customer cannot open my order confirmation', async ({ aliceApi, page }) => {
        await aliceApi.addItem(PRODUCTS.keyboard.id, 1);
        const order = await (await aliceApi.placeOrder(VALID_SHIPPING)).json();

        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(USERS.bob.username, USERS.bob.password);
        await expect(page).toHaveURL(/\/products\.html$/);

        const confirmationPage = new ConfirmationPage(page);
        await confirmationPage.goto(order.orderId);
        await expect(confirmationPage.notFound).toBeVisible();
        await expect(confirmationPage.content).toBeHidden();
    });
});