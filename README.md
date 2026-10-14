# ShopEase

![CI](https://github.com/alokbarmanai/shopease/actions/workflows/ci.yml/badge.svg)

A demo online store built to practise **production-style quality engineering**:
requirements, a layered app, unit tests, a Playwright + TypeScript automation suite
and a CI pipeline that blocks merging when tests fail.

## Features
- Login and logout, with locked-account handling
- Product catalog with search and category filter
- Shopping cart with quantity and stock rules
- Discount coupons and free-shipping threshold
- Checkout with shipping validation, order confirmation and order history

## Quick Start

```bash
cd shopease-app
npm install
npm run dev
```

Open http://localhost:3000 and log in as `alice` / `Shop@123`.
More details: [Development Guide](docs/DEVELOPMENT.md)

## Testing

| Layer | Tool | Location | Tests |
|-------|------|----------|-------|
| Unit | Node test runner | `shopease-app/test/unit` | 53 |
| API | Playwright | `shopease-tests/tests/api` | 63 |
| UI / E2E | Playwright | `shopease-tests/tests/ui` | 32 |

Run everything locally from the repository root: `npm run setup` (once), then `npm test`.
See [Running Tests Locally](docs/DEVELOPMENT.md#8-running-tests-locally).

Every Pull Request runs all layers in GitHub Actions; `main` is protected by required checks.
Strategy: [Test Plan](docs/TEST-PLAN.md) · Suite guide: [shopease-tests/README.md](shopease-tests/README.md)

## Repository Structure

| Folder | Purpose |
|--------|---------|
| `docs/` | Business, technical and QA documents |
| `shopease-app/` | The ShopEase web application (API + UI) and its unit tests |
| `shopease-tests/` | Playwright + TypeScript automation suite (API + UI) |
| `.github/workflows/` | CI pipeline |

## Documents

| Document | Description |
|----------|-------------|
| [Business Requirements (BRD)](docs/BRD.md) | What the business needs: requirements and rules |
| [Architecture](docs/ARCHITECTURE.md) | Layers, API contract, testability approach |
| [Test Plan](docs/TEST-PLAN.md) | Scope, test pyramid, coverage matrix, CI and exit criteria |
| [Requirement Questions](docs/REQUIREMENT-QUESTIONS.md) | Open questions raised during development and testing |
| [Development Guide](docs/DEVELOPMENT.md) | How to run the app locally |

## Tech Stack

| Area | Technology |
|------|------------|
| Backend | Node.js, Express |
| Frontend | HTML, CSS, JavaScript (no framework) |
| Unit tests | Node test runner (`node:test`) |
| Automation | Playwright + TypeScript |
| CI | GitHub Actions |