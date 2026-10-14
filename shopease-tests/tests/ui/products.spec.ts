import { test, expect } from '../../fixtures';
import { ProductsPage } from '../../pages/ProductsPage';
import { PRODUCTS } from '../../test-data/products';
import { formatMoney } from '../../utils/money';

test.describe('Products page (BR-02, BR-03)', { tag: '@ui' }, () => {
    test('shows all products with USD prices (RULE-09)', async ({ alicePage }) => {
        const productsPage = new ProductsPage(alicePage);
        await productsPage.goto();

        await expect(productsPage.productNames).toHaveText(Object.values(PRODUCTS).map((p) => p.name));
        for (const product of Object.values(PRODUCTS)) {
            await expect(productsPage.card(product.id).getByTestId('product-price')).toHaveText(
                formatMoney(product.priceCents),
            );
        }
    });

    test('out-of-stock products cannot be added (RULE-03)', async ({ alicePage }) => {
        const productsPage = new ProductsPage(alicePage);
        await productsPage.goto();

        await expect(productsPage.card(PRODUCTS.webcam.id).getByTestId('product-stock')).toHaveText('Out of Stock');
        await expect(productsPage.addToCartButton(PRODUCTS.webcam.id)).toBeDisabled();
    });

    test('search finds products by partial name', async ({ alicePage }) => {
        const productsPage = new ProductsPage(alicePage);
        await productsPage.goto();
        await productsPage.searchFor('mouse');

        await expect(productsPage.productNames).toHaveText(['Wireless Mouse']);
    });

    test('a search without results says so', async ({ alicePage }) => {
        const productsPage = new ProductsPage(alicePage);
        await productsPage.goto();
        await productsPage.searchFor('xyz');

        await expect(productsPage.noProducts).toBeVisible();
        await expect(productsPage.productNames).toHaveCount(0);
    });

    test('category filter shows only that category', async ({ alicePage }) => {
        const productsPage = new ProductsPage(alicePage);
        await productsPage.goto();
        await productsPage.filterByCategory('Audio');

        await expect(productsPage.productNames).toHaveText(['Noise-Cancelling Headphones']);
    });

    test('adding to cart shows a message and updates the badge', { tag: '@smoke' }, async ({ alicePage }) => {
        const productsPage = new ProductsPage(alicePage);
        await productsPage.goto();
        await productsPage.addToCart(PRODUCTS.mouse.id);

        await expect(productsPage.message).toHaveText('Wireless Mouse added to cart');
        await expect(productsPage.header.cartBadge).toHaveText('1');
    });

    test('adding more than the stock shows the server message (RULE-02)', async ({ alicePage }) => {
        const productsPage = new ProductsPage(alicePage);
        await productsPage.goto();
        await productsPage.addToCart(PRODUCTS.hub.id);
        await expect(productsPage.header.cartBadge).toHaveText('1');
        await productsPage.addToCart(PRODUCTS.hub.id);
        await expect(productsPage.header.cartBadge).toHaveText('2');
        await productsPage.addToCart(PRODUCTS.hub.id);

        await expect(productsPage.message).toHaveText('Only 2 left in stock');
        await expect(productsPage.header.cartBadge).toHaveText('2');
    });
});