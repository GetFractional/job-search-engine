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
  return email ? { email, fullName: "Matt Dimock", displayName: "Matt Dimock" } : null;
}

function authorizeFounder(user: ChatGPTUser | null): ChatGPTUser {
  if (!user) throw new FounderAccessError("Sign in with ChatGPT to continue.", 401);
  const ownerEmail = normalizedEmail(runtimeEnv().WAY_AHEAD_OWNER_EMAIL);
  if (!ownerEmail) {
    throw new FounderAccessError("Owner access is not configured.", 503);
  }
  if (normalizedEmail(user.email) !== ownerEmail) {
    throw new FounderAccessError("This founder environment is not shared with this account.", 403);
  }
  return { ...user, email: ownerEmail };
}

export function requireFounderRequest(request: Request): ChatGPTUser {
  return authorizeFounder(
    fromRequestHeaders(request.headers) ?? developmentActor(request.headers),
  );
}

export async function requireFounderPage(returnTo = "/"): Promise<ChatGPTUser> {
  const requestHeaders = await headers();
  const user = fromRequestHeaders(requestHeaders) ?? developmentActor(requestHeaders);
  if (!user) redirect(chatGPTSignInPath(returnTo));
  return authorizeFounder(user);
}

export function founderAuthErrorResponse(error: unknown): Response {
  if (error instanceof FounderAccessError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "The request could not be authorized." }, { status: 401 });
}
