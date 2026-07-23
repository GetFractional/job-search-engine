/** Narrow Cloudflare runtime declarations used by the production founder app. */
interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface D1Result<T = Record<string, unknown>> {
  success: boolean;
  results: T[];
  meta?: Record<string, unknown>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<Array<D1Result<T>>>;
}

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    WAY_AHEAD_OWNER_EMAIL?: string;
    WAY_AHEAD_DEV_EMAIL?: string;
    WAY_AHEAD_ENVIRONMENT?: string;
  };
}
