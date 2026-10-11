# ShopEase – Architecture Overview

| Item        | Detail                         |
|-------------|--------------------------------|
| Document ID | SE-ARCH-001                    |
| Version     | 1.0                            |
| Date        | 2026-10-11                     |
| Related     | [BRD](BRD.md) (SE-BRD-001)     |
| Status      | Approved                       |

---

## 1. System Overview
ShopEase is a web application with three layers:

```
┌──────────────────────────┐        HTTP + JSON         ┌──────────────────────────┐
│   FRONTEND (Browser)     │  ───────────────────────►  │   BACKEND (Express API)  │
│  HTML pages + JavaScript │  ◄───────────────────────  │  Business rules live here│
│  login, products, cart…  │                            │  (pricing, stock, coupon)│
└──────────────────────────┘                            └────────────┬─────────────┘
                                                                     │
                                                                     ▼
                                                        ┌──────────────────────────┐
                                                        │   DATA (in-memory store) │
                                                        │  Loaded from BRD §8 data │
                                                        │  Resets on restart       │
                                                        └──────────────────────────┘
```

| Layer    | Technology            | Responsibility                                   |
|----------|-----------------------|--------------------------------------------------|
| Frontend | HTML, CSS, JavaScript | Display data, collect user input. No business logic. |
| Backend  | Node.js + Express     | REST API. Enforces ALL business rules (BRD §7).  |
| Data     | In-memory store       | Holds users, products, carts, orders.            |

- One server on **http://localhost:3000** serves both pages and API.

## 2. Authentication
- `POST /api/auth/login` returns a **token**.
- The frontend stores the token and sends it on every request:
  `Authorization: Bearer <token>`
- Requests without a valid token receive **401 Unauthorized**.

## 3. API Contract

| Method | Endpoint                         | Purpose                       | BRD          |
|--------|----------------------------------|-------------------------------|--------------|
| POST   | /api/auth/login                  | Log in, get a token           | BR-01        |
| POST   | /api/auth/logout                 | Log out                       | BR-01        |
| GET    | /api/products?search=&category=  | List, search, filter          | BR-02        |
| GET    | /api/cart                        | View cart with totals         | BR-03        |
| POST   | /api/cart/items                  | Add item                      | BR-03        |
| PATCH  | /api/cart/items/:productId       | Change quantity               | BR-03        |
| DELETE | /api/cart/items/:productId       | Remove item                   | BR-03        |
| POST   | /api/cart/coupon                 | Apply coupon                  | BR-04        |
| DELETE | /api/cart/coupon                 | Remove coupon                 | BR-04        |
| POST   | /api/orders                      | Place order                   | BR-05, BR-06 |
| GET    | /api/orders                      | Order history                 | BR-07        |
| GET    | /api/health                      | Health check                  | –            |
| POST   | /api/test/reset                  | Reset data (test-only)        | –            |

### Standard HTTP status codes
| Code | Meaning                                   |
|------|-------------------------------------------|
| 200  | Success                                   |
| 201  | Created (e.g. order placed)               |
| 400  | Validation error / business rule broken   |
| 401  | Not logged in / invalid token             |
| 403  | Forbidden (e.g. locked account)           |
| 404  | Resource not found                        |

### Standard error response
```json
{ "error": "Human readable message" }
```

## 4. Testability
| Practice | Purpose |
|----------|---------|
| `data-testid` attributes on key UI elements | Stable locators for UI automation |
| `POST /api/test/reset` | Every test starts from known seed data. Disabled in production. |
| Deterministic seed data (BRD §8) | Tests can rely on known users, products, coupons |

## 5. Key Decisions
| ID     | Decision | Reason |
|--------|----------|--------|
| ADR-01 | Single repository (monorepo) for docs, app, tests | Simpler setup; docs and tests change with code |
| ADR-02 | In-memory data, no database | No installation needed; easy reset for tests |
| ADR-03 | Plain HTML/JS frontend (no framework) | Easy to read for learning |
| ADR-04 | Playwright + TypeScript for automation | Modern, fast, supports both UI and API testing |