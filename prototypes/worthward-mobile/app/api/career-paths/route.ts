import { apiErrorResponse, readBoundedJson, requireSameOrigin } from "../../api-utils";
import { founderAuthErrorResponse, FounderAccessError, requireFounderRequest } from "../../server-auth";
import { setPrimaryCareerPath } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const actor = requireFounderRequest(request);
    requireSameOrigin(request);
    const payload = await readBoundedJson(request, 10_000) as { pathId?: unknown };
    if (typeof payload.pathId !== "string" || !payload.pathId.trim()) {
      throw new Error("Choose a career path to make primary.");
    }
    await setPrimaryCareerPath(actor, payload.pathId);
    return Response.json({ saved: true });
  } catch (error) {
    if (error instanceof FounderAccessError) return founderAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
