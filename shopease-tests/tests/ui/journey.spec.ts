import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { ConfirmationPage } from '../../pages/ConfirmationPage';
import { OrdersPage } from '../../pages/OrdersPage';
import { PRODUCTS } from '../../test-data/products';
import { USERS } from '../../test-data/users';
import { VALID_SHIPPING } from '../../test-data/shipping';

test('a customer can log in, shop, check out and find the order', { tag: ['@smoke', '@ui', '@e2e'] }, async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const confirmationPage = new ConfirmationPage(page);
    const ordersPage = new OrdersPage(page);
    let orderId = '';

    await test.step('log in', async () => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(USERS.alice.username, USERS.alice.password);
        await expect(productsPage.header.userName).toHaveText('Hi, Alice Johnson');
    });

    await test.step('add a Mechanical Keyboard to the cart', async () => {
        await productsPage.addToCart(PRODUCTS.keyboard.id);
        await expect(productsPage.header.cartBadge).toHaveText('1');
    });

    await test.step('review the cart', async () => {
        await productsPage.header.cartLink.click();
        await expect(cartPage.summary.total).toHaveText('$54.99');
        await cartPage.proceedToCheckout();
    });

    await test.step('check out', async () => {
        await checkoutPage.fillShipping(VALID_SHIPPING);
        await checkoutPage.placeOrder();
    });

    await test.step('see the confirmation', async () => {
        await expect(page).toHaveURL(/\/confirmation\.html\?orderId=SE-\d{6}$/);
        await expect(confirmationPage.orderId).toHaveText(/^SE-\d{6}$/);
        orderId = await confirmationPage.orderId.innerText();
        await expect(confirmationPage.itemCount).toHaveText('1');
        await expect(confirmationPage.total).toHaveText('$54.99');
        await expect(confirmationPage.header.cartBadge).toHaveText('0');
    });

    await test.step('find the same order in the history', async () => {
        await confirmationPage.viewOrdersLink.click();
        await expect(ordersPage.row(orderId)).toBeVisible();
        await expect(ordersPage.row(orderId).getByTestId('order-total')).toHaveText('$54.99');
    });
});