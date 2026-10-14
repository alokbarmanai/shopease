// Seed products from BRD §8.2. Prices are in cents, exactly as the API returns them.
export const PRODUCTS = {
    mouse: { id: 'P001', name: 'Wireless Mouse', category: 'Accessories', priceCents: 1999, stock: 25 },
    keyboard: { id: 'P002', name: 'Mechanical Keyboard', category: 'Peripherals', priceCents: 4999, stock: 10 },
    hub: { id: 'P003', name: 'USB-C Hub', category: 'Accessories', priceCents: 2999, stock: 2 },
    stand: { id: 'P004', name: 'Laptop Stand', category: 'Accessories', priceCents: 3450, stock: 15 },
    headphones: { id: 'P005', name: 'Noise-Cancelling Headphones', category: 'Audio', priceCents: 8900, stock: 5 },
    webcam: { id: 'P006', name: 'HD Webcam', category: 'Peripherals', priceCents: 3999, stock: 0 },
} as const;