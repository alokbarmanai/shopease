# Assignment: End-to-End Walkthrough (Customer Perspective)

| Item    | Detail                                             |
|---------|----------------------------------------------------|
| Scope   | Whole application – all pages, all business rules  |
| BRD Ref | BR-01 to BR-07 · RULE-01 to RULE-13                |
| Tool    | Browser only (+ one reset call)                    |
| Time    | ~60–90 minutes                                     |
| Status  | To Do                                              |

---

## 1. Goal
Use ShopEase exactly like a real customer. Understand every business flow
before it is automated. Record anything that looks wrong, confusing, or odd –
even when it is not covered by a test below.

## 2. Before Each Journey
1. Server running: `npm run dev` (see `docs/DEVELOPMENT.md`)
2. Reset data: **POST** `http://localhost:3000/api/test/reset`
3. Refresh the browser → log in again

---

## 3. Scripted Journeys (expected results given)

### Journey 1 – Happy Path: First Purchase
| Step | Action                                                   | Expected |
|------|----------------------------------------------------------|----------|
| 1.1  | Log in as `alice` / `Shop@123`                           | Products page, header *Hi, Alice Johnson*, badge **0** |
| 1.2  | Add **Mechanical Keyboard**                              | Green message, badge **1** |
| 1.3  | Open **Cart**                                            | Subtotal $49.99 · Discount $0.00 · Shipping **$5.00** · Total **$54.99** |
| 1.4  | **Proceed to Checkout**, fill valid details*, Place Order | Confirmation: Order ID `SE-` + 6 digits, Items 1, Total **$54.99** |
| 1.5  | Open **My Orders**                                       | 1 order, same Order ID, $54.99 |
| 1.6  | Open **Products**                                        | Mechanical Keyboard **In stock: 9** |

\* Valid details: `Alice Johnson` · `1 Main St` · `Austin` · `73301` · `5125550100`

### Journey 2 – Coupons & Free Shipping
| Step | Action                                                   | Expected |
|------|----------------------------------------------------------|----------|
| 2.1  | Add **Wireless Mouse** ×1 and **Laptop Stand** ×1        | Cart: Subtotal **$54.49**, Shipping **FREE**, Total **$54.49** |
| 2.2  | Apply `save10`                                           | Discount **-$5.45**, Shipping **FREE**? → check: $54.49 − $5.45 = $49.04 < $50 → Shipping **$5.00**, Total **$54.04** |
| 2.3  | Remove coupon, apply `FLAT5`                             | Discount **-$5.00**, Shipping **$5.00**, Total **$54.49** (see RQ-03) |
| 2.4  | Remove **Laptop Stand**                                  | Subtotal $19.99, Discount **$0.00**, FLAT5 still shown (see RQ-04) |
| 2.5  | Remove coupon, apply `EXPIRED20`                         | Red: *This coupon has expired* |

### Journey 3 – Validation & Limits
| Step | Action                                                   | Expected |
|------|----------------------------------------------------------|----------|
| 3.1  | Log in with empty fields                                 | *Username and password are required* |
| 3.2  | Log in as `locked_user` / `Shop@123`                     | *Your account is locked. Please contact support* |
| 3.3  | As alice, add **USB-C Hub** 3 times                      | 3rd click: *Only 2 left in stock* |
| 3.4  | In Cart, set Wireless Mouse quantity to **6**            | *Quantity must be between 1 and 5*; box returns to previous value |
| 3.5  | Checkout with ZIP `1234`                                 | *ZIP Code must be exactly 5 digits* |
| 3.6  | Checkout with phone `512-555-0100`                       | *Phone must be exactly 10 digits* (see RQ-05) |
| 3.7  | Open `/checkout.html` with an empty cart                 | *Your cart is empty. Add products before checking out.* |

### Journey 4 – Two Customers, One Product (stock race)
You need two separate sessions: use a **normal window for alice** and a
**private window (Ctrl+Shift+N) for bob** – they do not share login storage.

| Step | Action                                                   | Expected |
|------|----------------------------------------------------------|----------|
| 4.1  | alice: add **USB-C Hub** ×2 to cart                      | Badge 2 |
| 4.2  | bob: add **USB-C Hub** ×2 to cart                        | Badge 2 (adding to a cart does not reserve stock) |
| 4.3  | bob: checkout and Place Order                            | Order confirmed |
| 4.4  | alice: checkout and Place Order                          | Red error about USB-C Hub stock; **no** order created |
| 4.5  | alice: open Products                                     | USB-C Hub **Out of Stock** |
| 4.6  | alice: open My Orders                                    | *You have no orders yet.* |

### Journey 5 – Session & Security
| Step | Action                                                   | Expected |
|------|----------------------------------------------------------|----------|
| 5.1  | Log out, open `/products.html` directly                  | Redirected to login |
| 5.2  | As alice, place an order and copy the confirmation URL   | – |
| 5.3  | Log out, log in as bob, open alice's confirmation URL    | *Order not found* |
| 5.4  | As bob, open My Orders                                   | Only bob's orders |
| 5.5  | While logged in, reset data (POST /api/test/reset), then click any link | Sent to login page (session cleared) |

---

## 4. Exploratory Testing (unscripted, ~15 min each)
No expected results – explore and record what you find.

| Charter | Explore… |
|---------|----------|
| EX-1    | Products search & filter with unusual input (spaces, symbols, very long text) |
| EX-2    | Cart quantity box: typing, arrows, empty value, decimals |
| EX-3    | Browser **Back** / **Refresh** at every step of checkout |
| EX-4    | Narrow window / phone size (F12 → device toolbar) – is every page usable? |
| EX-5    | Error message **wording** – is every message clear to a non-technical customer? |

---

## 5. Findings Log (fill in)

| ID    | Page / Step | What I saw | What I expected | Type (Bug / Usability / Question) | Screenshot |
|-------|-------------|------------|-----------------|-----------------------------------|------------|
| F-01  |             |            |                 |                                   |            |
| F-02  |             |            |                 |                                   |            |
| F-03  |             |            |                 |                                   |            |

## 6. After the Walkthrough
- Real bugs → create a **GitHub Issue** (same format as issue #2)
- Unclear rules → add to `docs/REQUIREMENT-QUESTIONS.md` (next ID: RQ-06)
- Usability ideas → note them for the Product Owner
