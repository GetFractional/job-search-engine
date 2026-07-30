import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { chatGPTSignInPath, type ChatGPTUser } from "./chatgpt-auth";

type RuntimeEnv = {
  WAY_AHEAD_OWNER_EMAIL?: string;
  WAY_AHEAD_DEV_EMAIL?: string;
  WAY_AHEAD_ENVIRONMENT?: string;
};

export class FounderAccessError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403 | 503,
  ) {
    super(message);
  }
}

/**
 * FounderAccessError is retained as the compatibility name used by the
 * existing API routes. Access is now account-level; owner authorization is
 * enforced only by the owner-only repository action.
 */
export { FounderAccessError as UserAccessError };

function runtimeEnv(): RuntimeEnv {
  return env as unknown as RuntimeEnv;
}

function normalizedEmail(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.includes("@") ? normalized : null;
}

function decodeFullName(headerValue: string | null, encoding: string | null): string | null {
  if (!headerValue || encoding !== "percent-encoded-utf-8") return null;
  try {
    return decodeURIComponent(headerValue);
  } catch {
    return null;
  }
}

function fromRequestHeaders(requestHeaders: Headers): ChatGPTUser | null {
  const email = normalizedEmail(requestHeaders.get("oai-authenticated-user-email"));
  if (!email) return null;
  const fullName = decodeFullName(
    requestHeaders.get("oai-authenticated-user-full-name"),
    requestHeaders.get("oai-authenticated-user-full-name-encoding"),
  );
  return { email, fullName, displayName: fullName ?? email };
}

function developmentActor(requestHeaders: Headers): ChatGPTUser | null {
  const config = runtimeEnv();
  if (config.WAY_AHEAD_ENVIRONMENT !== "development") return null;
  const host = requestHeaders.get("host")?.split(":")[0];
  if (host !== "localhost" && host !== "127.0.0.1") return null;
  const email = normalizedEmail(config.WAY_AHEAD_DEV_EMAIL);
  return email
    ? { email, fullName: "Local QA User", displayName: "Local QA User" }
    : null;
}

function authorizeUser(user: ChatGPTUser | null): ChatGPTUser {
  if (!user) throw new FounderAccessError("Sign in with ChatGPT to continue.", 401);
  const email = normalizedEmail(user.email);
  if (!email) throw new FounderAccessError("The signed-in account has no usable email address.", 401);
  return { ...user, email };
}

export function requireUserRequest(request: Request): ChatGPTUser {
  return authorizeUser(
    fromRequestHeaders(request.headers) ?? developmentActor(request.headers),
  );
}

export async function requireUserPage(returnTo = "/app/home"): Promise<ChatGPTUser> {
  const requestHeaders = await headers();
  const user = fromRequestHeaders(requestHeaders) ?? developmentActor(requestHeaders);
  if (!user) redirect(chatGPTSignInPath(returnTo));
  return authorizeUser(user);
}

export function userAuthErrorResponse(error: unknown): Response {
  if (error instanceof FounderAccessError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "The request could not be authorized." }, { status: 401 });
}

/**
 * Compatibility aliases keep the current API routes working while their
 * imports move from founder language to user language. They do not grant the
 * owner role.
 */
export const requireFounderRequest = requireUserRequest;
export const requireFounderPage = requireUserPage;
export const founderAuthErrorResponse = userAuthErrorResponse;
