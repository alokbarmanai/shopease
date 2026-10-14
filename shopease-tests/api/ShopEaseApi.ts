import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { User } from '../test-data/users';

// One method per endpoint of the API contract (ARCHITECTURE.md §3).
// Methods return the raw response: the TEST decides what to assert.
export class ShopEaseApi {
    private token: string | null = null;

    constructor(private readonly request: APIRequestContext) { }

    private authHeaders(): Record<string, string> {
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    }

    // ---------- Auth ----------
    login(username: string, password: string): Promise<APIResponse> {
        return this.request.post('/api/auth/login', { data: { username, password } });
    }

    // Logs in, remembers the token for the next requests, and returns it.
    async loginAs(user: User): Promise<string> {
        const response = await this.login(user.username, user.password);
        if (!response.ok()) {
            throw new Error(`Login as ${user.username} failed with status ${response.status()}`);
        }
        const body = await response.json();
        this.token = body.token;
        return body.token;
    }

    // Use a specific token (or none) for the next requests.
    useToken(token: string | null): void {
        this.token = token;
    }

    logout(): Promise<APIResponse> {
        return this.request.post('/api/auth/logout', { headers: this.authHeaders() });
    }

    // ---------- Products ----------
    getProducts(query: Record<string, string> = {}): Promise<APIResponse> {
        return this.request.get('/api/products', { params: query, headers: this.authHeaders() });
    }

    // ---------- Cart ----------
    getCart(): Promise<APIResponse> {
        return this.request.get('/api/cart', { headers: this.authHeaders() });
    }

    // `quantity` is `unknown` on purpose, so negative tests can send wrong types (e.g. "3").
    addItem(productId: string, quantity: unknown): Promise<APIResponse> {
        return this.request.post('/api/cart/items', {
            data: { productId, quantity },
            headers: this.authHeaders(),
        });
    }

    updateQuantity(productId: string, quantity: unknown): Promise<APIResponse> {
        return this.request.patch(`/api/cart/items/${productId}`, {
            data: { quantity },
            headers: this.authHeaders(),
        });
    }

    removeItem(productId: string): Promise<APIResponse> {
        return this.request.delete(`/api/cart/items/${productId}`, { headers: this.authHeaders() });
    }

    applyCoupon(code: string): Promise<APIResponse> {
        return this.request.post('/api/cart/coupon', { data: { code }, headers: this.authHeaders() });
    }

    removeCoupon(): Promise<APIResponse> {
        return this.request.delete('/api/cart/coupon', { headers: this.authHeaders() });
    }

    // ---------- Orders ----------
    placeOrder(shipping: Record<string, unknown>): Promise<APIResponse> {
        return this.request.post('/api/orders', { data: { shipping }, headers: this.authHeaders() });
    }

    getOrders(): Promise<APIResponse> {
        return this.request.get('/api/orders', { headers: this.authHeaders() });
    }
}