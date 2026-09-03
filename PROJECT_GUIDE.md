# Project Guide

This file provides guidance for AI coding assistants and other automated tooling working with code in this repository.

## Project state

The framework is built out and the suite passes end to end against a SauceDemo-style storefront ("TTACart"): login → inventory list → item detail → cart → 3-step checkout.

- `src/pages/*.ts` — all Page Objects are **implemented**. They extend `BasePage`, which supplies `page`, `el` (a `UtilElementLocator`), `log` (a scoped Winston logger), and `goto()`. Subclasses declare their own `private readonly` locators; `BasePage` pre-builds none.
- `src/fixtures/test-base.ts` — implemented. Specs import `test`/`expect` from `@fixtures/test-base`, **not** from `@playwright/test`. It exposes one fixture per page object plus a chain of state fixtures (`invalidLogin`, `validLogin` → `loginWithInventory` → `loginWithSelectedItem`).
- `src/config/` — implemented: `env.ts` (`requireEnv`/`envOr`/`assertEnv`) and `credentials.ts`. Read env through these rather than touching `process.env` directly in specs or pages.
- `src/tests/` — `login/login.spec.ts` plus three e2e specs under `e2e/`. There is no `example.spec.ts` any more.
- `src/utils/CustomReporter.ts` — a large (~2.2k line) standalone HTML reporter writing to `tta-report/`, plus a run snapshot to `reports/runs/*.json` for flaky diffing.
- `src/ai/` — **stubs only.** `providers.hasApiKey()` always returns `false`, which gates every LLM path; `rcaAgent.analyzeFailure()` throws if called directly. `flakyAnalyzer.analyzeFlaky()` is real and needs no key — it deterministically diffs the current run against the previous one.
- `src/api/`, `rules/`, `docs/` — still empty, tracked via `.gitkeep`.
- `package.json` defines scripts (`test`, `test:headed`, `test:ui`, `test:debug`, `report`) — prefer them over raw `npx playwright`, since `npm run` always executes from the package root.

Known issues:

- **`tsc` cannot type-check this project.** `package.json` pins `typescript: ^7.0.2`, but `tsconfig.json` still uses `moduleResolution: "node"` and `baseUrl`, both removed in TS 7. `npx tsc --noEmit` fails on config errors before checking any source. This does *not* affect `npm test` — Playwright transpiles specs itself and resolves `paths` independently.
- **`e2e-checkout-env.spec.ts` aborts the whole run when its env vars are missing.** It calls `assertEnv('STANDARD_USER', 'TTA_SECRET')` and `requireEnv('CHECKOUT_ITEM_ID')` at module load, so a missing key throws during collection and no tests execute at all. Set all three in `.env`. Note that `--grep-invert` does **not** work around this — Playwright imports every spec before filtering — so to skip it you must pass the other paths explicitly: `npm test -- src/tests/login src/tests/e2e/e2e-checkout.spec.ts src/tests/e2e/e2e-checkout_new_fixture.spec.ts`.

When implementing new pages/tests, follow the structure already declared in `tsconfig.json` and README.md rather than introducing a different layout.

## Commands

```bash
# Install deps and browsers (first-time setup)
npm install
npx playwright install

# Run the full suite
npm test

# Run a single spec file
npm test -- src/tests/login/login.spec.ts

# Run a single test by name / tag
npm test -- -g "test name substring"
npm test -- --grep @p0

# Run against a specific project (only 'chromium' is currently defined)
npm test -- --project=chromium

# Run headed / debug / UI mode
npm run test:headed
npm run test:debug
npm run test:ui

# Attach a screenshot to the report after every visualStep()
ATTACH_SCREENSHOTS=true npm test

# View the HTML report from the last run
npm run report
```

There is no lint/build/typecheck script configured, and `tsc --noEmit` currently fails on `tsconfig.json` itself (see Known issues above) — `npm test` is the only working verification gate.

## Architecture

- **Test runner config**: `playwright.config.ts` is the single source of truth for run behavior:
  - Loads `.env` via `dotenv` before anything else.
  - `resolveBaseURL()` picks the `baseURL` for tests: explicit `BASE_URL` wins; otherwise it switches on `TTA_ENV` (`qa` default, plus `stg`/`stage`/`staging`, `prod`/`production`, `dev`/`local`, `api`) to select the matching `*_BASE_URL` env var, falling back to a hardcoded default per environment.
  - `testDir: ./src/tests`, 60s test timeout, 10s expect timeout, `fullyParallel: true`, retries `2` on CI (`process.env.CI`) else `0`.
  - Reporters: `html`, `list`, and the local `./src/utils/CustomReporter.ts`.
  - `trace: 'on'` and `video: 'on'` for every run (not just failures); screenshots only on failure.
  - Only one project is defined: `chromium` (Desktop Chrome).
- **Environment/config**: env values come from a git-ignored root `.env`. Go through `src/config/env.ts` (`requireEnv`, `envOr`, `assertEnv`) and `src/config/credentials.ts` rather than reading `process.env` directly — `playwright.config.ts` is the one deliberate exception, since it runs before the aliases resolve. Credentials are `STANDARD_USER`/`TTA_SECRET`, **not** `USERNAME`/`PASSWORD` (the latter collide with shell/CI-provided vars, which `dotenv` will not overwrite). See the README table for the full var list.
- **Path aliases**: `tsconfig.json` defines `@api/*`, `@config/*`, `@fixtures/*`, `@pages/*`, `@testdata/*`, `@utils/*` mapped to their respective `src/*` subfolders. Use these instead of relative (`../../../`) imports; Playwright resolves them at run time, so they work in specs as-is. There is no alias for `src/ai/*` — the reporter imports it relatively.
- **Page Object Model**: `src/pages/BasePage.ts` is the shared abstract base; every page class extends it and receives `page`, `el`, `log`, and `goto()`. One file per page/flow step.
- **Fixtures**: `src/fixtures/test-base.ts` is the entry point for specs. Add a new page object's fixture there when you add the page, so specs never call `new SomePage(page)` directly.
- **Data-driven testing**: `src/testdata/logintestdata.json` backs the login fixtures; `DataGenerator` (Faker) supplies checkout/customer data. CSV (`csv-parse`), Excel (`xlsx`), and JSONPath (`jsonpath-plus`) are installed but not yet used.
- **API testing**: `src/api/` is the intended home for API clients/helpers, with `ajv`/`ajv-formats` for JSON schema validation of responses. Not yet implemented.
- **Logging/reporting**: Winston logging via `createLogger(scope)` in `src/utils/logger.ts`, used as `this.log` in pages and directly in specs; output goes to `logs/`. Allure (`allure-playwright`) is installed but still not registered in `playwright.config.ts`'s `reporter` array.
- **CI**: `.github/workflows/playwright.yml` runs on push/PR to `main`/`master` on `ubuntu-latest` (60 min timeout): `npm ci` → `npx playwright install --with-deps` → `npx playwright test` → uploads `playwright-report/` as a build artifact (30-day retention) even on failure/cancellation.
