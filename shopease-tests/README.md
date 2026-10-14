# ShopEase – Automation Suite

Playwright + TypeScript tests for the ShopEase app: **API tests** for the REST contract and
**UI tests** for what the customer sees, including an end-to-end checkout journey.
Strategy and scope: [Test Plan](../docs/TEST-PLAN.md).

## Quick Start

```bash
cd shopease-tests
npm install
npx playwright install chromium
npm test
```

Playwright starts the app automatically (`../shopease-app`, `npm start`) before the tests.
Install the app's dependencies once first: `cd ../shopease-app && npm install`.

## Commands

| Command | Runs |
|---------|------|
| `npm test` | API tests + UI tests in Chromium |
| `npm run test:api` | API tests only |
| `npm run test:ui` | UI tests only |
| `npm run test:smoke` | Tests tagged `@smoke` (critical paths) |
| `npm run test:headed` | UI tests in a visible browser |
| `npm run test:all-browsers` | All projects, incl. Firefox (`npx playwright install firefox` first) |
| `npm run typecheck` | TypeScript check of the whole suite |
| `npm run report` | Open the last HTML report |

## Structure

```text
shopease-tests/
├── playwright.config.ts   Projects (api, chromium, firefox), web server, reporting
├── tests/
│   ├── api/               API tests – HTTP only, no browser
│   └── ui/                UI tests – real browser, incl. journey.spec.ts (end to end)
├── pages/                 Page Object Model – one class per page + shared components
├── api/                   API client – one method per endpoint
├── fixtures/              Test setup: data reset, API clients, logged-in browser page
├── test-data/             Seed data from the BRD: users, products, coupons, shipping
└── utils/                 Small helpers (money formatting)
```

## Conventions

| Topic | Rule |
|-------|------|
| Imports | Tests import `test` and `expect` from `fixtures`, never directly from `@playwright/test` |
| Test data | Every test starts from fresh seed data – `POST /api/test/reset` runs automatically |
| Isolation | Tests never depend on each other; tests run one at a time (`workers: 1`) because the app has one shared in-memory store |
| Layers | Rules are tested at the lowest layer that can prove them; UI tests cover display and journeys |
| Locators | `data-testid` via `getByTestId`, only inside page objects |
| Assertions | Page objects and the API client never assert – tests do |
| Waiting | Web-first assertions only – no fixed sleeps |
| Tags | `@smoke`, `@api`, `@ui`, `@e2e` |
| Traceability | Test names reference BRD IDs (BR-xx, RULE-xx) and open questions (RQ-xx) |
| Random values | Checked by format, e.g. Order ID `/^SE-\d{6}$/` |

## Adding a Test

1. Put it in `tests/api` or `tests/ui` (by layer), in the spec file of the feature.
2. Use fixtures: `api`, `aliceApi`, `bobApi` (API clients) or `alicePage` (logged-in browser).
3. Arrange data through the API, act and assert through the layer under test.
4. New page elements → add the locator to the page object, not to the test.
5. Run `npm run typecheck` and `npm test` before pushing.

## Reports and Debugging

- HTML report: `npm run report`
- On failure, a **screenshot**, **video** and **trace** are kept in `test-results/`.
  Open a trace with `npx playwright show-trace <path-to-trace.zip>`.
- In CI, the HTML report is uploaded as the `playwright-report` artifact of each run.