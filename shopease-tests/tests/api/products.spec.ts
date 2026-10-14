import { test, expect } from '../../fixtures';
import { PRODUCTS } from '../../test-data/products';

const ALL_NAMES = Object.values(PRODUCTS).map((p) => p.name);

test.describe('Products API (BR-02)', { tag: '@api' }, () => {
    test('lists all 6 products with stock status (RULE-03)', { tag: '@smoke' }, async ({ aliceApi }) => {
        const response = await aliceApi.getProducts();

        expect(response.status()).toBe(200);
        const expected = Object.values(PRODUCTS).map((p) => ({ ...p, inStock: p.stock > 0 }));
        expect(await response.json()).toEqual(expected);
    });

    const searches: { id: string; query: Record<string, string>; expected: string[] }[] = [
        { id: 'P-01', query: { search: 'mouse' }, expected: ['Wireless Mouse'] },
        { id: 'P-02', query: { search: 'MOUSE' }, expected: ['Wireless Mouse'] },
        { id: 'P-03', query: { search: 'o' }, expected: ['Wireless Mouse', 'Mechanical Keyboard', 'Laptop Stand', 'Noise-Cancelling Headphones'] },
        { id: 'P-04', query: { category: 'Audio' }, expected: ['Noise-Cancelling Headphones'] },
        { id: 'P-05', query: { category: 'Accessories', search: 'hub' }, expected: ['USB-C Hub'] },
        { id: 'P-06', query: { search: 'xyz' }, expected: [] },
        { id: 'P-07', query: { search: ' mo' }, expected: ['Wireless Mouse'] },
        { id: 'P-08', query: { category: 'Au' }, expected: [] },
        { id: 'P-09', query: { search: '' }, expected: ALL_NAMES },
    ];

    for (const { id, query, expected } of searches) {
        test(`${id}: ${JSON.stringify(query)}`, async ({ aliceApi }) => {
            const response = await aliceApi.getProducts(query);

            expect(response.status()).toBe(200);
            const names = (await response.json()).map((p: { name: string }) => p.name);
            expect(names).toEqual(expected);
        });
    }
});