# Advanced Framework Playwright

A TypeScript-based test automation framework built on [Playwright](https://playwright.dev/), scaffolded for scalable UI + API testing with page objects, fixtures, schema validation, and reporting.

## Tech Stack

- **Playwright** (`@playwright/test`) — end-to-end test runner (Chromium, Firefox, WebKit)
- **TypeScript** — with path aliases for clean imports
- **Allure Playwright** — test reporting
- **Winston** — logging
- **Ajv / Ajv-formats** — JSON schema validation (useful for API response checks)
- **dotenv** — environment variable management
- **@faker-js/faker** — test data generation
- **csv-parse**, **xlsx**, **jsonpath-plus** — external/data-driven test data support

## Project Structure

```
├── .github/workflows/     # CI pipeline (GitHub Actions)
├── docs/                  # Project documentation
├── rules/                 # Framework/coding rules & conventions
├── src/
│   ├── api/               # API clients/helpers
│   ├── config/            # Environment & framework configuration
│   ├── fixtures/          # Custom Playwright fixtures
│   ├── pages/             # Page Object Model classes
│   ├── testdata/          # Static/generated test data (CSV, JSON, XLSX)
│   ├── tests/             # Spec files
│   └── utils/             # Shared utility/helper functions
├── playwright.config.ts   # Playwright configuration
└── tsconfig.json          # TypeScript configuration + path aliases
```

Empty folders are tracked with `.gitkeep` placeholders so the intended structure is preserved in version control until they're populated.

### Path aliases

Configured in `tsconfig.json` for cleaner imports:

| Alias | Path |
|---|---|
| `@api/*` | `src/api/*` |
| `@config/*` | `src/config/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@pages/*` | `src/pages/*` |
| `@testdata/*` | `src/testdata/*` |
| `@utils/*` | `src/utils/*` |

## What's done so far

- [x] Initial project scaffolding (folder structure for pages, fixtures, api, config, utils, test data)
- [x] Playwright configuration (`playwright.config.ts`) with Chromium, Firefox, and WebKit projects, HTML reporter, and trace-on-retry
- [x] TypeScript configuration with path aliases
- [x] `.env` support via `dotenv`, loaded in `playwright.config.ts`
- [x] GitHub Actions CI workflow (`.github/workflows/playwright.yml`) — runs on push/PR to `main`/`master`, installs browsers, runs the suite, and uploads the HTML report as an artifact
- [x] Core dependencies installed: Allure reporting, Winston logging, Ajv schema validation, Faker test data generation, CSV/XLSX/JSONPath data-driven testing support
- [x] Sample spec (`src/tests/example.spec.ts`) verifying the setup works end-to-end

## Getting Started

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests
npx playwright test

# View HTML report
npx playwright show-report
```

## CI

Tests run automatically on GitHub Actions for pushes and pull requests targeting `main`/`master`. See `.github/workflows/playwright.yml`. The Playwright HTML report is uploaded as a build artifact on every run.
