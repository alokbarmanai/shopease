# ShopEase – Test Plan

| Item        | Detail                                              |
|-------------|-----------------------------------------------------|
| Document ID | SE-TP-001                                           |
| Version     | 1.0                                                 |
| Date        | 2026-10-13                                          |
| Owner       | Alok (QA Lead)                                      |
| Related     | [BRD](BRD.md) (SE-BRD-001) · [Architecture](ARCHITECTURE.md) (SE-ARCH-001) |
| Status      | Draft – Under Review                                |

---

## 1. Purpose
Define how ShopEase v1.x is verified: what is tested, at which layer, with which
tools and data, how tests run in CI, and when the product is considered ready to release.

## 2. Scope

### 2.1 In Scope
- All business requirements BR-01 to BR-07 and rules RULE-01 to RULE-13
- REST API contract (ARCHITECTURE.md §3), including status codes and error messages
- UI behaviour on all six pages (login, products, cart, checkout, confirmation, order history)
- Security checks: authentication required, cart and order privacy, test endpoint disabled in production
- Non-functional: NFR-02 (browsers), NFR-03 (password masked)

### 2.2 Out of Scope (this version)
- Performance and load testing (NFR-01 is checked informally only)
- Penetration testing
- Visual (pixel) comparison testing
- Real mobile devices (responsive layout is checked at phone width in the browser)

## 3. Test Approach – the Test Pyramid

| Layer | Tool | Location | Owner | Focus |
|-------|------|----------|-------|-------|
| Unit | Node test runner (`node:test`) | `shopease-app/test/unit/` | Development | Business rules in services: pricing, cart, coupons, orders |
| API | Playwright (`request` fixture) | `shopease-tests/tests/api/` | QA | HTTP contract: endpoints, status codes, messages, auth, data isolation |
| UI / E2E | Playwright (browser) | `shopease-tests/tests/ui/` | QA | What the customer sees and does: pages, messages, navigation, journeys |

**Layer rule:** every rule is tested at the **lowest layer that can prove it**.
Calculations and validation combinations belong in unit and API tests.
UI tests check that the result **reaches the customer** (correct message shown,
button disabled, page navigation) and cover the end-to-end journeys – they do not
repeat every combination already proven below.

## 4. Test Types and Tags

| Tag | Meaning | When it runs |
|-----|---------|--------------|
| `@smoke` | Critical paths only (login, add to cart, checkout) | Every Pull Request – fast feedback |
| `@regression` | The full suite | Every Pull Request and every push to `main` |
| `@api` / `@ui` | Layer of the test | Used to run one layer on its own |

## 5. Coverage Matrix (Traceability)

| Requirement / Rule | Unit | API | UI |
|--------------------|:----:|:---:|:--:|
| BR-01 Login, locked account, logout |  | ✔ | ✔ |
| BR-02 Product list, search, category filter |  | ✔ | ✔ |
| BR-03 Cart: add, change quantity, remove, badge | ✔ | ✔ | ✔ |
| BR-04 Coupons: apply, invalid, expired, remove | ✔ | ✔ | ✔ |
| BR-05 Checkout: shipping details, empty cart | ✔ | ✔ | ✔ |
| BR-06 Order ID, cart emptied, stock reduced | ✔ | ✔ | ✔ |
| BR-07 Order history, newest first | ✔ | ✔ | ✔ |
| RULE-01 Quantity 1–5 | ✔ | ✔ | ✔ |
| RULE-02 Quantity ≤ stock (incl. re-check at checkout) | ✔ | ✔ | ✔ |
| RULE-03 Out of stock cannot be added | ✔ | ✔ | ✔ |
| RULE-04 One coupon per order | ✔ | ✔ |  |
| RULE-05 Coupon codes not case-sensitive | ✔ | ✔ | ✔ |
| RULE-06 – RULE-08 Discount, shipping, total | ✔ | ✔ | ✔ |
| RULE-09 USD with 2 decimals |  |  | ✔ |
| RULE-10 – RULE-12 Shipping field validation | ✔ | ✔ | ✔ |
| RULE-13 Order ID format | ✔ | ✔ | ✔ |
| Security: auth required, cart/order privacy |  | ✔ | ✔ |
| Security: test reset disabled in production |  | ✔ (manual) |  |
| NFR-02 Chrome, Edge, Firefox |  |  | ✔ |
| NFR-03 Password masked |  |  | ✔ |

## 6. Test Environment

| Item | Detail |
|------|--------|
| Application | Started automatically by Playwright (`webServer`) at http://localhost:3000 |
| Local machine | Windows, Node.js 20+ |
| CI | GitHub Actions, `ubuntu-latest`, Node.js 22 |
| Browsers – every PR | Chromium (the engine of Chrome and Edge) |
| Browsers – before a release | Chromium and Firefox |

## 7. Test Data
- Seed data from BRD §8: accounts `alice`, `bob`, `locked_user`; products P001–P006; coupons SAVE10, FLAT5, EXPIRED20.
- **Every test starts from clean data:** `POST /api/test/reset` runs before each test.
- Tests never depend on each other or on the order they run in.
- Random values (Order IDs) are checked by **format** (`SE-` + 6 digits), never by exact value.
- Dates are not asserted to the minute (the displayed time depends on the browser's time zone).

## 8. Automation Framework

| Topic | Decision |
|-------|----------|
| Tool / language | Playwright + TypeScript |
| Structure | `tests/api`, `tests/ui`, `pages` (Page Object Model), `fixtures`, `test-data`, `utils` |
| Locators | `data-testid` first (`getByTestId`); roles and labels where they express user intent |
| Waiting | Playwright auto-waiting and web-first assertions only – **no fixed sleeps** |
| Reporting | HTML report; screenshot, video and trace kept on failure |
| Retries | 0 locally; 2 in CI, and every flaky pass is investigated |

## 9. Entry and Exit Criteria

**Entry (testing can start):**
- The application builds and starts; `GET /api/health` returns `{ "status": "ok" }`
- Unit tests pass in CI

**Exit (ready to release):**
- 100% of `@smoke` and `@regression` tests pass on `main`
- No open defects of severity **High** or **Critical**
- Known issues are listed in the release notes

## 10. Defect Management
- Defects are logged as **GitHub Issues** with the label `bug`, using the format:
  Summary · Environment · Precondition · Steps · Expected · Actual · Severity / Priority · Evidence.
- Requirement gaps are logged in [REQUIREMENT-QUESTIONS.md](REQUIREMENT-QUESTIONS.md).
- **Flaky tests:** a test that fails intermittently is tagged `@flaky`, an issue is opened,
  and it is fixed or removed – flaky tests are never ignored.

## 11. CI Integration

| Job | Runs | Trigger |
|-----|------|---------|
| Unit tests | `npm test` in `shopease-app` | Every PR, push to `main` |
| API & UI tests | Playwright suite in `shopease-tests` (Chromium) | Every PR, push to `main` |

- Both jobs are **required checks** on `main` (ruleset "Protect main").
- The Playwright HTML report is uploaded as a build artifact for every run.

## 12. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Tests affect each other through shared data | Reset before every test; no shared state between tests |
| Flaky timing | Auto-waiting, web-first assertions, no sleeps |
| Time-zone dependent output | No exact time assertions; fixed time zone in config if needed |
| Open requirement questions (RQ-01 – RQ-06) | Tests pin **current** behaviour and reference the RQ ID; updated after each decision |
| Slow UI tests | Rules tested at unit/API level; UI covers journeys and display |

## 13. Roles

| Role | Person |
|------|--------|
| Product Owner | Alok |
| Development | Alok |
| QA Lead / Automation | Alok |

## 14. Deliverables
- This test plan
- Automation suite `shopease-tests/` with its own README
- Playwright HTML reports from CI
- Defect reports (GitHub Issues) and requirement questions log

## 15. Approval

| Name | Role | Decision | Date |
|------|------|----------|------|
| Alok | QA Lead | Approved | 10/13/2026 |
