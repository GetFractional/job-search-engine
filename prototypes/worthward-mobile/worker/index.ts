/** Cloudflare Worker entry point for the multi-user Way Ahead application. */
import handler from "vinext/server/app-router-entry";
import { ensureRuntimeIntegrityTriggers } from "../db/integrity";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

function secureResponse(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("Content-Security-Policy", "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  if (new URL(request.url).protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      await ensureRuntimeIntegrityTriggers(env.DB);
      return secureResponse(await handler.fetch(request, env, ctx), request);
    } catch {
      return secureResponse(
        Response.json(
          { error: "Way Ahead storage integrity is not ready yet." },
          { status: 503 },
        ),
        request,
      );
    }
  },
};

export default worker;
