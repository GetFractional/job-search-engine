export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const target = new URL(request.url);
  if (!origin || origin !== target.origin) {
    throw new Error("This write must come from the signed-in Way Ahead workspace.");
  }
}

export async function readBoundedJson(request: Request, maximumBytes = 250_000): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new Error("A JSON request body is required.");
  }
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new Error("The request is larger than this founder environment accepts.");
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maximumBytes) {
    throw new Error("The request is larger than this founder environment accepts.");
  }
  return JSON.parse(body) as unknown;
}

export function apiErrorResponse(error: unknown, status = 400): Response {
  const message = error instanceof Error ? error.message : "The request could not be completed.";
  return Response.json({ error: message }, { status });
}
