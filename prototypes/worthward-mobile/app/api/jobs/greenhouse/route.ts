import { apiErrorResponse, readBoundedJson, requireSameOrigin } from "../../../api-utils";
import { founderAuthErrorResponse, FounderAccessError, requireFounderRequest } from "../../../server-auth";
import { ingestGreenhouseJob } from "../../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireFounderRequest(request);
    requireSameOrigin(request);
    const payload = await readBoundedJson(request, 15_000) as { url?: unknown };
    if (typeof payload.url !== "string" || payload.url.length > 2_000) {
      throw new Error("Enter a direct employer job URL.");
    }
    const result = await ingestGreenhouseJob(actor, payload.url);
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof FounderAccessError) return founderAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
