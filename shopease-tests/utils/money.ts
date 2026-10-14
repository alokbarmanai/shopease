// RULE-09: cents -> "$49.99", exactly like the app shows it.
export function formatMoney(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}