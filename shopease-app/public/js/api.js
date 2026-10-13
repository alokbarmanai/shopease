// Shared browser helpers used by every page:
// login state, API calls, and money formatting.

const TOKEN_KEY = 'shopease_token';
const USER_KEY = 'shopease_user';

// Login state is kept in the browser's localStorage.
const auth = {
    save(loginResponse) {
        localStorage.setItem(TOKEN_KEY, loginResponse.token);
        localStorage.setItem(
            USER_KEY,
            JSON.stringify({ username: loginResponse.username, fullName: loginResponse.fullName })
        );
    },
    token() {
        return localStorage.getItem(TOKEN_KEY);
    },
    user() {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};

// Calls the ShopEase API and returns the JSON response.
// On failure, throws an Error containing the server's message.
async function api(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth.token()) {
        headers.Authorization = `Bearer ${auth.token()}`;
    }

    const response = await fetch(`/api${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));

    // Session expired (e.g. server restarted): go back to the login page.
    if (response.status === 401 && path !== '/auth/login') {
        auth.clear();
        window.location.href = '/index.html';
        throw new Error('Session expired');
    }

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
}

// RULE-09: USD with 2 decimals, e.g. 4999 -> "$49.99"
function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}

// Shows a server timestamp (UTC) in the user's local time,
// e.g. "2026-10-12T03:47:04Z" -> "Oct 11, 2026, 10:47 PM" (in US Central time)
function formatDate(isoString) {
    return new Date(isoString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}