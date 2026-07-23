import { apiErrorResponse, readBoundedJson, requireSameOrigin } from "../../api-utils";
import { founderAuthErrorResponse, FounderAccessError, requireFounderRequest } from "../../server-auth";
import { createPursuit } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireFounderRequest(request);
    requireSameOrigin(request);
    const payload = await readBoundedJson(request, 10_000) as { jobPostingId?: unknown };
    if (typeof payload.jobPostingId !== "string" || !payload.jobPostingId.trim()) {
      throw new Error("A verified job is required to start a pursuit.");
    }
    const pursuitId = await createPursuit(actor, payload.jobPostingId);
    return Response.json({ pursuitId }, { status: 201 });
  } catch (error) {
    if (error instanceof FounderAccessError) return founderAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
