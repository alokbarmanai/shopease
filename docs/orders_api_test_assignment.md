# Assignment: Orders API – Full Checkout Test (Thunder Client)

| Item        | Detail                                   |
|-------------|------------------------------------------|
| Feature     | Checkout & Order History                 |
| BRD Ref     | BR-05, BR-06, BR-07 · RULE-10 to RULE-13 |
| Tool        | Thunder Client (VS Code)                 |
| Status      | To Do                                    |

---

## 1. Goal
Verify through the API that:
- An order cannot be placed with an empty cart (BR-05)
- Shipping fields are validated (RULE-10, RULE-11, RULE-12)
- A rejected order changes NOTHING (stock stays the same)
- A valid order returns 201, empties the cart and reduces stock (BR-06)
- Order ID format is SE- + 6 digits (RULE-13)
- Order history shows newest order first (BR-07)

## 2. Before You Start
1. Open a terminal in `shopease-app` and run: `npm run dev`
2. Wait for: `ShopEase running at http://localhost:3000`
3. **Do NOT save any code file during the test** – saving restarts the server,
   which wipes all data and your login token.

## 3. How to Send Each Request
1. Thunder Client → **New Request** (or reuse a tab with the same method + URL)
2. Set the **method** (dropdown left of the URL) and the **URL**
3. **Auth** tab → **Bearer** → paste alice's token (not needed for reset/login)
4. If there is a body: **Body** tab → **JSON** → `Ctrl+A` → paste → **Send**
5. Check **Status** first, then the **response body**

> If you get an unexpected **401**, your token is no longer valid.
> Log in again (Step S-2) and paste the new token into every tab.

---

## 4. Setup

### S-1: Reset all data to the starting state
- **POST** `http://localhost:3000/api/test/reset`
- No token, no body
- Expected: **200** · `{ "message": "Test data reset" }`

> Reset also logs everyone out – that is why login comes next.

### S-2: Log in as alice
- **POST** `http://localhost:3000/api/auth/login`
- Body:
```json
{ "username": "alice", "password": "Shop@123" }
```
- Expected: **200** · copy the `token` value (without quotes)

---

## 5. Test Cases (run in this exact order)

### Valid shipping body (used in O-06 and O-10)
```json
{
  "shipping": {
    "fullName": "Alice Johnson",
    "address": "1 Main St",
    "city": "Austin",
    "zipCode": "73301",
    "phone": "5125550100"
  }
}
```

---

### O-01: Place order with empty cart
- **POST** `http://localhost:3000/api/orders`
- Body: the valid shipping body
- Expected: **400** · `Cart is empty`

### S-3: Add a Keyboard to the cart
- **POST** `http://localhost:3000/api/cart/items`
- Body:
```json
{ "productId": "P002", "quantity": 1 }
```
- Expected: **200** · Mechanical Keyboard in cart, `totalCents: 5499`

### O-02: Missing ZIP Code (RULE-12)
- **POST** `http://localhost:3000/api/orders`
- Body:
```json
{
  "shipping": {
    "fullName": "Alice Johnson",
    "address": "1 Main St",
    "city": "Austin",
    "phone": "5125550100"
  }
}
```
- Expected: **400** · `ZIP Code is required`

### O-03: ZIP Code with 4 digits (RULE-10)
- **POST** `http://localhost:3000/api/orders`
- Body:
```json
{
  "shipping": {
    "fullName": "Alice Johnson",
    "address": "1 Main St",
    "city": "Austin",
    "zipCode": "1234",
    "phone": "5125550100"
  }
}
```
- Expected: **400** · `ZIP Code must be exactly 5 digits`

### O-04: Phone with 5 digits (RULE-11)
- **POST** `http://localhost:3000/api/orders`
- Body:
```json
{
  "shipping": {
    "fullName": "Alice Johnson",
    "address": "1 Main St",
    "city": "Austin",
    "zipCode": "73301",
    "phone": "12345"
  }
}
```
- Expected: **400** · `Phone must be exactly 10 digits`

### O-05: Rejected orders did not change stock
- **GET** `http://localhost:3000/api/products?search=keyboard`
- Expected: **200** · Mechanical Keyboard `"stock": 10` (unchanged)

### O-06: Place a valid order
- **POST** `http://localhost:3000/api/orders`
- Body: the valid shipping body
- Expected: **201 Created** with:
  - `orderId` matching format `SE-` + 6 digits (e.g. `SE-985305`) → **write it down**
  - `paymentMethod`: `Cash on Delivery`
  - `subtotalCents: 4999` · `discountCents: 0` · `shippingCents: 500` · `totalCents: 5499`

### O-07: Cart is emptied after order (BR-06)
- **GET** `http://localhost:3000/api/cart`
- Expected: **200** · `"items": []` · `"itemCount": 0`

### O-08: Stock is reduced after order (BR-06)
- **GET** `http://localhost:3000/api/products?search=keyboard`
- Expected: **200** · Mechanical Keyboard `"stock": 9`

### O-09: Order appears in history (BR-07)
- **GET** `http://localhost:3000/api/orders`
- Expected: **200** · list with **1** order · same `orderId` as O-06 · `totalCents: 5499`

### S-4: Add a Mouse to the cart
- **POST** `http://localhost:3000/api/cart/items`
- Body:
```json
{ "productId": "P001", "quantity": 1 }
```
- Expected: **200**

### O-10: Place a second valid order
- **POST** `http://localhost:3000/api/orders`
- Body: the valid shipping body
- Expected: **201** · new `orderId` (different from O-06) · `totalCents: 2499`

### O-11: Newest order first (BR-07)
- **GET** `http://localhost:3000/api/orders`
- Expected: **200** · **2** orders:
  - 1st in list → order from O-10 · `totalCents: 2499`
  - 2nd in list → order from O-06 · `totalCents: 5499`

---

## 6. Test Execution Report (fill in)

| ID   | Expected                                   | Actual Status | Actual Result | Pass/Fail |
|------|--------------------------------------------|---------------|---------------|-----------|
| O-01 | 400 · Cart is empty                        |               |               |           |
| O-02 | 400 · ZIP Code is required                 |               |               |           |
| O-03 | 400 · ZIP Code must be exactly 5 digits    |               |               |           |
| O-04 | 400 · Phone must be exactly 10 digits      |               |               |           |
| O-05 | 200 · Keyboard stock 10                    |               |               |           |
| O-06 | 201 · SE-xxxxxx · total 5499               |               |               |           |
| O-07 | 200 · cart items []                        |               |               |           |
| O-08 | 200 · Keyboard stock 9                     |               |               |           |
| O-09 | 200 · 1 order · total 5499                 |               |               |           |
| O-10 | 201 · new SE-xxxxxx · total 2499           |               |               |           |
| O-11 | 200 · 2 orders · newest (2499) first       |               |               |           |

## 7. Rules for Recording Results
- Record the **status code** for every test
- **Copy and paste** actual messages – do not retype them
- Result column = **Pass** or **Fail** only
- If a test fails: re-run it once, then take a screenshot of request + response