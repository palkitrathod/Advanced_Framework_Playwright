/**
 * DataGenerator — Faker-backed fake data for the TTACart project.
 *
 * TTACart is a SauceDemo-style storefront: it needs login credentials and
 * checkout customer info (first name, last name, postal code). This util
 * centralises all random data so tests stay deterministic-friendly (one
 * import) and read naturally.
 *
 * Faker API notes (installed: v10 — see `@faker-js/faker` in package.json):
 *   - `faker.internet.username()`        lowercase. `userName()` was removed
 *      after v8, and calling it throws "is not a function".
 *   - `faker.internet.password({length})` options-object form; avoids the
 *      deprecated positional overload
 *   - `faker.location.zipCode()`         v8 renamed `address` -> `location`
 *   - `faker.number.int({min, max})`     v8 renamed `datatype.number`
 */

// Layer 1 : 3 Interfaces are just forms
import { faker } from '@faker-js/faker';
import { envOr } from '@config/env';

export interface Credentials {
    username: string;
    password: string;
}

export interface CheckoutCustomer {
    firstName: string;
    lastName: string;
    postalCode: string;
}

export interface UserProfile extends Credentials, CheckoutCustomer {
    email: string;
    fullName: string;
    phone: string;
}


//Layer 2 - Vending Machine with two rows

export class DataGenerator {
    // ---------- credentials ----------

    /** Random username, e.g. "Otilia35". */
    static username(): string {
        return faker.internet.username();
    }

    /**
     * Random password. Defaults to a 12-char password.
     * Pass length to tune for negative-test cases.
     */
    static password(length = 12): string {
        return faker.internet.password({ length });
    }

    /** Username + password pair. */
    static credentials(): Credentials {
        return {
            username: DataGenerator.username(),
            password: DataGenerator.password(),
        };
    }

    // ---------- contact ----------

    static firstName(): string {
        return faker.person.firstName();
    }

    static lastName(): string {
        return faker.person.lastName();
    }

    static email(): string {
        return faker.internet.email();
    }

    static phone(): string {
        return faker.phone.number();
    }

    static postalCode(): string {
        return faker.location.zipCode();
    }

    // ---------- primitives ----------

    /** Random whole number between min and max (both inclusive). */
    static number(min: number, max: number): number {
        return faker.number.int({ min, max });
    }

    /** Random true/false. */
    static bool(): boolean {
        return faker.datatype.boolean();
    }

    /** Pick one item at random from a list. Keeps the literal type. */
    static oneOf<T>(items: readonly T[]): T {
        return faker.helpers.arrayElement(items);
    }

    /**
     * A calendar date shifted by `days`, as `YYYY-MM-DD`.
     *
     * restful-booker wants plain dates, not timestamps, so we cut the ISO
     * string at the `T`. Pass `from` to offset off a specific date instead of
     * today — that is how a check-out date is derived from its check-in.
     */
    static dateOffset(days: number, from: Date = new Date()): string {
        const date = new Date(from);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    // ---------- composites ----------

    /** Customer info for the TTACart checkout step-one form. */
    static checkoutCustomer(): CheckoutCustomer {
        return {
            firstName: DataGenerator.firstName(),
            lastName: DataGenerator.lastName(),
            postalCode: DataGenerator.postalCode(),
        };
    }

    /**
     * Checkout customer taken from `.env`, with a generated value for anything
     * that is not set. Lets a run be pinned to known data without editing code.
     *
     * Reads CHECKOUT_FIRST_NAME, CHECKOUT_LAST_NAME and CHECKOUT_POSTAL_CODE
     * (all listed in `.env.example`). Used by `e2e-checkout-env.spec.ts`.
     */
    static checkoutCustomerFromEnv(): CheckoutCustomer {
        return {
            firstName: envOr('CHECKOUT_FIRST_NAME', DataGenerator.firstName()),
            lastName: envOr('CHECKOUT_LAST_NAME', DataGenerator.lastName()),
            postalCode: envOr('CHECKOUT_POSTAL_CODE', DataGenerator.postalCode()),
        };
    }

    /** Full profile — creds + checkout fields + contact. */
    static userProfile(): UserProfile {
        const firstName = DataGenerator.firstName();
        const lastName = DataGenerator.lastName();
        return {
            username: DataGenerator.username(),
            password: DataGenerator.password(),
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email: faker.internet.email({ firstName, lastName }),
            phone: DataGenerator.phone(),
            postalCode: DataGenerator.postalCode(),
        };
    }
}

export default DataGenerator;