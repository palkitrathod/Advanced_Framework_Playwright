/**
 * BasePage - shared scaffolding for every TTACart Page Object.
 *
 * The TTACart suite is intentionally thin. We only inherit:
 *  - `page`     -> Playwright Page handle
 *  - `el`       -> UtilElementLocator wrapper for actions
 *  - `log`      -> a per-page Logger (scope = the subclass name)
 *  - `goto(p)`  -> small navigation helper that respects baseURL
 *
 * Subclasses still declare their own `private readonly` Locator fields; the
 * base class deliberately does NOT pre-build any locators.
 */
//Every single page will going to inherit from this base page. This is the base page for all the pages in the application.

import {Page} from "@playwright/test";

export abstract class BasePage 
{
    protected readonly page: Page;
    protected constructor (page : Page, scope : string)
    {
        this.page = page;
    }
    protected async goto (relativePath : string) : Promise<void>
    {
        await this.page.goto(relativePath);
        await this.page.waitForLoadState("domcontentloaded");
    }
}