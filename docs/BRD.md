# ShopEase – Business Requirements Document (BRD)

| Item          | Detail                  |
|---------------|-------------------------|
| Document ID   | SE-BRD-001              |
| Version       | 1.0                     |
| Date          | 2026-10-11              |
| Owner         | Alok (Product Owner)    |
| Status        | Draft – Under Review    |

---

## 1. Purpose
ShopEase is a small online store where registered customers can browse
products, add them to a cart, apply a discount coupon, and place an order.
This document describes WHAT the business needs. It does not describe HOW
it will be built.

## 2. Business Objectives
- OBJ-01: Let customers find and buy products quickly and without confusion.
- OBJ-02: Encourage bigger orders using free shipping and coupons.
- OBJ-03: Never sell more items than are available in stock.

## 3. Scope

### 3.1 In Scope
- Customer login and logout
- Product catalog with search and category filter
- Shopping cart
- Discount coupons
- Checkout with shipping details
- Order confirmation and order history

### 3.2 Out of Scope (this release)
- New user registration
- Real online payment (orders are "Cash on Delivery")
- Admin panel for managing products
- Email notifications

## 4. Stakeholders
| Role            | Responsibility                          |
|-----------------|-----------------------------------------|
| Product Owner   | Defines and approves requirements       |
| Development     | Builds the application                  |
| QA              | Verifies requirements, manual + automation |
| End Customer    | Uses the store to buy products          |

## 5. User Types
| User Type       | Description                                   |
|-----------------|-----------------------------------------------|
| Active Customer | Can log in and use all features               |
| Locked Customer | Account blocked; cannot log in                |

## 6. Business Requirements

### BR-01: Login
- Customer logs in with username and password.
- Wrong username or password shows: "Invalid username or password".
- Locked customer sees: "Your account is locked. Please contact support".
- Empty username or password shows a "required" message.
- Customer must be logged in to access any store page.
- Customer can log out at any time.

### BR-02: Product Catalog
- Shows all products with name, category, price, and stock status.
- Customer can search products by name (partial, case-insensitive).
- Customer can filter products by category.
- Out-of-stock products are visible but cannot be added to the cart.

### BR-03: Shopping Cart
- Customer can add products, change quantity, and remove products.
- Cart shows each item's line total and the cart subtotal.
- Cart icon in the header shows the total number of items.
- Cart is saved for the customer until the order is placed.

### BR-04: Coupons
- Customer can apply one coupon code on the cart page.
- Valid coupon shows the discount amount.
- Invalid or expired coupon shows an error message.
- Customer can remove an applied coupon.

### BR-05: Checkout
- Customer enters shipping details: Full Name, Address, City, ZIP Code, Phone.
- Customer reviews the order summary before placing the order.
- Customer cannot check out with an empty cart.

### BR-06: Order Confirmation
- After the order is placed, the customer sees a unique Order ID.
- The cart becomes empty.
- Product stock is reduced by the ordered quantity.

### BR-07: Order History
- Customer can see a list of their past orders
  (Order ID, date, number of items, total amount).
- Newest orders appear first.

## 7. Business Rules

| Rule ID | Rule |
|---------|------|
| RULE-01 | Quantity per product must be between 1 and 5. |
| RULE-02 | Quantity cannot be more than the available stock. |
| RULE-03 | Products with stock 0 show "Out of Stock" and cannot be added. |
| RULE-04 | Only ONE coupon can be applied per order. |
| RULE-05 | Coupon codes are NOT case-sensitive (save10 = SAVE10). |
| RULE-06 | Discount is calculated on the subtotal. |
| RULE-07 | Shipping is FREE when (subtotal - discount) is $50.00 or more; otherwise $5.00. |
| RULE-08 | Order Total = Subtotal - Discount + Shipping. |
| RULE-09 | All amounts are shown in USD with 2 decimals (e.g. $49.99). |
| RULE-10 | ZIP Code must be exactly 5 digits. |
| RULE-11 | Phone must be exactly 10 digits. |
| RULE-12 | All shipping fields are mandatory. |
| RULE-13 | Order ID format is "SE-" followed by 6 digits (e.g. SE-104523). |

### 7.1 Coupon Codes
| Code       | Benefit                     | Condition                    | Status  |
|------------|-----------------------------|------------------------------|---------|
| SAVE10     | 10% off the subtotal        | None                         | Active  |
| FLAT5      | $5.00 off                   | Subtotal must be $30 or more | Active  |
| EXPIRED20  | 20% off                     | -                            | Expired |

## 8. Reference Data

### 8.1 Customer Accounts
| Username       | Password      | Type            |
|----------------|---------------|-----------------|
| alice          | Shop@123      | Active Customer |
| bob            | Shop@123      | Active Customer |
| locked_user    | Shop@123      | Locked Customer |

### 8.2 Products
| ID   | Name                         | Category     | Price  | Stock |
|------|------------------------------|--------------|--------|-------|
| P001 | Wireless Mouse               | Accessories  | 19.99  | 25    |
| P002 | Mechanical Keyboard          | Peripherals  | 49.99  | 10    |
| P003 | USB-C Hub                    | Accessories  | 29.99  | 2     |
| P004 | Laptop Stand                 | Accessories  | 34.50  | 15    |
| P005 | Noise-Cancelling Headphones  | Audio        | 89.00  | 5     |
| P006 | HD Webcam                    | Peripherals  | 39.99  | 0     |

## 9. Non-Functional Requirements
- NFR-01: Every page loads in under 2 seconds.
- NFR-02: Works on the latest Chrome, Edge, and Firefox.
- NFR-03: Passwords are never shown on screen in plain text.

## 10. Assumptions & Constraints
- No real payment is taken; all orders are Cash on Delivery.
- Data is reset to the reference data (Section 8) when the application restarts.

## 11. Approval
| Name | Role          | Decision | Date |
|------|---------------|----------|------|
| Alok | Product Owner | Approved  |  10/11/2026    |