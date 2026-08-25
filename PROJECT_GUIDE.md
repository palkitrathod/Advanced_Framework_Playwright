# Project Guide

This file provides guidance for AI coding assistants and other automated tooling working with code in this repository.

## Project state

This is an early-stage scaffold, not a built-out framework. Most of the structure described below is *intended* architecture (per README.md), but much of it is currently empty:

- `src/pages/*.ts` (BasePage, LoginPage, InventoryPage, CartPage, ItemDetailPage, CheckoutStepOnePage, CheckoutStepTwoPage, CheckoutCompletePage) — all files exist but are **currently empty** (0 bytes). Page Object classes have not been implemented yet.
- `src/api/`, `src/config/`, `src/fixtures/`, `src/testdata/`, `rules/`, `docs/` — empty directories, tracked only via `.gitkeep`.
- `src/tests/example.spec.ts` — still the default Playwright scaffold test (navigates to playwright.dev), unrelated to the page objects above.
- `src/utils/CustomReporter.ts` — implemented; a minimal custom reporter that logs run/test start/end to the console.
- `package.json` has no `scripts` defined — use `npx playwright ...` directly (see Commands below).

The page object names (Login/Inventory/Cart/ItemDetail/CheckoutStepOne/CheckoutStepTwo/CheckoutComplete) match the Sauce Demo app flow (login → inventory list → item detail → cart → 3-step checkout), so that's the implied target application/flow for the POM layer once implemented.

When implementing new pages/tests, follow the structure already declared in `tsconfig.json` and referenced in README.md rather than introducing a different layout.

## Commands

No npm scripts exist yet — run Playwright's CLI directly.

```bash
# Install deps and browsers (first-time setup)
npm install
npx playwright install

# Run the full suite
npx playwright test

# Run a single spec file
npx playwright test src/tests/example.spec.ts

# Run a single test by name
npx playwright test -g "test name substring"

# Run against a specific project (only 'chromium' is currently defined)
npx playwright test --project=chromium

# Run headed / debug
npx playwright test --headed
npx playwright test --debug

# View the HTML report from the last run
npx playwright show-report
```

There is no separate lint/build/typecheck script configured; `tsc --noEmit` can be used to type-check against `tsconfig.json` if needed.

## Architecture

- **Test runner config**: `playwright.config.ts` is the single source of truth for run behavior:
  - Loads `.env` via `dotenv` before anything else.
  - `resolveBaseURL()` picks the `baseURL` for tests: explicit `BASE_URL` wins; otherwise it switches on `TTA_ENV` (`qa` default, plus `stg`/`stage`/`staging`, `prod`/`production`, `dev`/`local`, `api`) to select the matching `*_BASE_URL` env var, falling back to a hardcoded default per environment.
  - `testDir: ./src/tests`, 60s test timeout, 10s expect timeout, `fullyParallel: true`, retries `2` on CI (`process.env.CI`) else `0`.
  - Reporters: `html`, `list`, and the local `./src/utils/CustomReporter.ts`.
  - `trace: 'on'` and `video: 'on'` for every run (not just failures); screenshots only on failure.
  - Only one project is defined: `chromium` (Desktop Chrome).
- **Environment/config**: all environment values flow through `process.env.*`, set via a git-ignored root `.env` (see README.md's table of `TTA_ENV`/`*_BASE_URL`/`API_BASE_URL`/`LOG_LEVEL`/`TEST_ENV`/`TEST_AUTHOR`/`USERNAME`/`PASSWORD`). `src/config/` is the intended home for typed wrappers around these vars, but is currently empty — reading `process.env` directly (as `playwright.config.ts` does) is the only pattern in place so far.
- **Path aliases**: `tsconfig.json` defines `@api/*`, `@config/*`, `@fixtures/*`, `@pages/*`, `@testdata/*`, `@utils/*` mapped to their respective `src/*` subfolders. Use these instead of relative (`../../../`) imports. Note the README's caveat: these aliases resolve for TypeScript/editor purposes only — if a bundler or `tsconfig-paths`-style runtime resolution isn't wired in, verify alias imports actually resolve at test-run time before relying on them.
- **Page Object Model**: `src/pages/BasePage.ts` is intended as the shared base class other page objects extend (common waits/navigation helpers), with one file per page/flow step. All are currently stubs to be filled in.
- **Data-driven testing**: intended support for CSV (`csv-parse`), Excel (`xlsx`), JSON (`jsonpath-plus`), and synthetic data (`@faker-js/faker`), materializing under `src/testdata/`. None of this is wired up yet.
- **API testing**: `src/api/` is the intended home for API clients/helpers, with `ajv`/`ajv-formats` for JSON schema validation of responses. Not yet implemented.
- **Logging/reporting**: Winston is a declared dependency for logging (no logger instance exists yet); Allure (`allure-playwright`) is a declared dependency for richer reporting but is not yet registered in `playwright.config.ts`'s `reporter` array.
- **CI**: `.github/workflows/playwright.yml` runs on push/PR to `main`/`master` on `ubuntu-latest` (60 min timeout): `npm ci` → `npx playwright install --with-deps` → `npx playwright test` → uploads `playwright-report/` as a build artifact (30-day retention) even on failure/cancellation.
