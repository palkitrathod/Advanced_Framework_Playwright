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

## Prerequisites

Make sure you have the following installed before setting up the project:

- [Node.js](https://nodejs.org/) v18 or later (LTS recommended) — includes `npm`
- [Git](https://git-scm.com/)
- A code editor with TypeScript support (e.g. [VS Code](https://code.visualstudio.com/))

Check your versions:

```bash
node -v
npm -v
git --version
```

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/palkitrathod/Advanced_Framework_Playwright.git
   cd Advanced_Framework_Playwright
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Playwright's browser binaries:

   ```bash
   npx playwright install
   ```

4. Create your local `.env` file (see [Environment Configuration](#environment-configuration) below).

5. Run the sample test suite to verify the setup:

   ```bash
   npx playwright test
   ```

## Environment Configuration

Environment variables are managed with `dotenv` and loaded automatically in `playwright.config.ts` from a `.env` file at the project root. `.env` is git-ignored, so each environment (local machine, CI, etc.) keeps its own copy.

Create a `.env` file in the project root with the following keys:

```
TTA_ENV=qa
BASE_URL=
QA_BASE_URL=
STG_BASE_URL=
PROD_BASE_URL=
DEV_BASE_URL=
API_BASE_URL=
LOG_LEVEL=info
TEST_ENV=QA
TEST_AUTHOR=
USERNAME=
PASSWORD=
```

| Variable | Description |
|---|---|
| `TTA_ENV` | Active environment key used to select which `*_BASE_URL` to run against (e.g. `qa`, `stg`, `prod`, `dev`) |
| `BASE_URL` | Default base URL of the application under test, used as the starting point for `page.goto()` calls |
| `QA_BASE_URL` | Base URL for the QA environment |
| `STG_BASE_URL` | Base URL for the Staging environment |
| `PROD_BASE_URL` | Base URL for the Production environment |
| `DEV_BASE_URL` | Base URL for local/dev environment (e.g. `http://localhost:3000`) |
| `API_BASE_URL` | Base URL for API test requests |
| `LOG_LEVEL` | Winston log verbosity (e.g. `info`, `debug`, `warn`, `error`) |
| `TEST_ENV` | Environment label used in test reports/logs |
| `TEST_AUTHOR` | Author tag used in test reports/logs |
| `USERNAME` | Login username for the application under test |
| `PASSWORD` | Login password for the application under test |

`.env` is git-ignored and never committed — treat `USERNAME`/`PASSWORD` and any future secrets as environment-specific and set them locally (or as CI secrets), not in source control. Reference these values via `process.env.<VAR_NAME>` in `src/config`, and add new variables here as the framework grows.

## Path Aliases

Configured in `tsconfig.json` (`compilerOptions.paths`) for cleaner, absolute-style imports instead of long relative paths (`../../../utils/...`):

| Alias | Path |
|---|---|
| `@api/*` | `src/api/*` |
| `@config/*` | `src/config/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@pages/*` | `src/pages/*` |
| `@testdata/*` | `src/testdata/*` |
| `@utils/*` | `src/utils/*` |

Example usage:

```ts
import { LoginPage } from '@pages/LoginPage';
import { getTestUser } from '@testdata/users';
```

> Note: `tsconfig.json` paths are used for type-checking and editor IntelliSense. If you introduce a build step or ship compiled JS, ensure the alias resolution also works at runtime (e.g. via `tsconfig-paths` or a bundler) or a test runner plugin that understands `paths`.

## Test Configuration

Defined in `playwright.config.ts`:

- **Test directory**: `./src/tests`
- **Browsers/projects**: Chromium, Firefox, WebKit (Desktop viewports)
- **Parallelization**: `fullyParallel: true` locally; `workers: 1` on CI
- **Retries**: `0` locally, `2` on CI (`process.env.CI`)
- **Reporter**: HTML (`npx playwright show-report` to view results)
- **Tracing**: captured `on-first-retry` for debugging failed tests
- **Environment loading**: `.env` is loaded via `dotenv` before the config is evaluated

Useful commands:

```bash
# Run all tests
npx playwright test

# Run a specific project/browser
npx playwright test --project=chromium

# Run in headed mode
npx playwright test --headed

# Run a single spec file
npx playwright test src/tests/example.spec.ts

# Open the last HTML report
npx playwright show-report
```

## Continuous Integration

CI is configured via GitHub Actions in `.github/workflows/playwright.yml`.

- **Triggers**: on `push` and `pull_request` to the `main` or `master` branches
- **Runner**: `ubuntu-latest`, with a 60-minute timeout
- **Steps**:
  1. Checkout the repository (`actions/checkout@v4`)
  2. Set up Node.js (`actions/setup-node@v4`, LTS version)
  3. Install dependencies with `npm ci`
  4. Install Playwright browsers with system dependencies (`npx playwright install --with-deps`)
  5. Run the full test suite (`npx playwright test`)
  6. Upload the HTML report as a build artifact (`playwright-report/`, retained for 30 days), even if the run fails or is cancelled

To view results from a CI run: open the workflow run on the **Actions** tab in GitHub and download the `playwright-report` artifact.
