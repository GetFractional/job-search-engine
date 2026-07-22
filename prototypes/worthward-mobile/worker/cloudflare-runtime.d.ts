/**
 * Narrow ambient declarations for the Cloudflare bindings used by the Sites
 * starter. The prototype has no database calls, but keeping the worker entry
 * point type-checkable prevents unrelated hosting scaffolding from weakening
 * the application quality gate.
 */
interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface D1Database {
  prepare(query: string): unknown;
}

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
  };
}
