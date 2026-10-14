// Shipping details as the checkout form and the orders API expect them (RULE-10 to RULE-12).
export type ShippingDetails = {
    fullName: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
};

// A valid address. Tests override single fields for negative cases.
export const VALID_SHIPPING: ShippingDetails = {
    fullName: 'Alice Johnson',
    address: '1 Main St',
    city: 'Austin',
    zipCode: '73301',
    phone: '5125550100',
};