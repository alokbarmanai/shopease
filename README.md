# ShopEase

A demo online store built to practise **production-style test automation**
with Playwright + TypeScript.

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

More details (test accounts, resetting data, troubleshooting):
[Development Guide](docs/DEVELOPMENT.md)

## Repository Structure

| Folder            | Purpose                                         |
|-------------------|-------------------------------------------------|
| `docs/`           | Business, technical and QA documents            |
| `shopease-app/`   | The ShopEase web application (API + UI)         |
| `shopease-tests/` | Playwright + TypeScript automation suite *(in progress)* |

## Documents

| Document | Description |
|----------|-------------|
| [Business Requirements (BRD)](docs/BRD.md) | What the business needs: requirements and rules |
| [Architecture](docs/ARCHITECTURE.md) | Layers, API contract, testability approach |
| [Requirement Questions](docs/REQUIREMENT-QUESTIONS.md) | Open questions raised during development and testing |
| [Development Guide](docs/DEVELOPMENT.md) | How to run the app locally |

## Tech Stack

| Area       | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js, Express                    |
| Frontend   | HTML, CSS, JavaScript (no framework)|
| Automation | Playwright + TypeScript *(in progress)* |

## Status
**v1.0** – application complete. Automation suite in progress.
