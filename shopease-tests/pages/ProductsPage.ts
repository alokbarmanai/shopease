import type { Locator, Page } from '@playwright/test';
import { Header } from './Header';

export class ProductsPage {
    readonly header: Header;
    readonly searchInput: Locator;
    readonly categoryFilter: Locator;
    readonly productNames: Locator;
    readonly noProducts: Locator;
    readonly message: Locator;

    constructor(readonly page: Page) {
        this.header = new Header(page);
        this.searchInput = page.getByTestId('search-input');
        this.categoryFilter = page.getByTestId('category-filter');
        this.productNames = page.getByTestId('product-grid').getByTestId('product-name');
        this.noProducts = page.getByTestId('no-products');
        this.message = page.getByTestId('page-message');
    }

    async goto(): Promise<void> {
        await this.page.goto('/products.html');
    }

    // One product card, e.g. card('P001'). Look inside it with .getByTestId(...).
    card(productId: string): Locator {
        return this.page.getByTestId(`product-card-${productId}`);
    }

    addToCartButton(productId: string): Locator {
        return this.page.getByTestId(`add-to-cart-${productId}`);
    }

    async addToCart(productId: string): Promise<void> {
        await this.addToCartButton(productId).click();
    }

    async searchFor(text: string): Promise<void> {
        await this.searchInput.fill(text);
    }

    async filterByCategory(category: string): Promise<void> {
        await this.categoryFilter.selectOption(category);
    }
}