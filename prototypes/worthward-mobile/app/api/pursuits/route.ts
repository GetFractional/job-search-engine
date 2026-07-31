import { apiErrorResponse, readBoundedJson, requireSameOrigin } from "../../api-utils";
import { ensurePursuitDocumentStarters } from "../../document-repository";
import {
  requireUserRequest,
  UserAccessError,
  userAuthErrorResponse,
} from "../../server-auth";
import { createPursuit } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = await readBoundedJson(request, 10_000) as { jobPostingId?: unknown };
    if (typeof payload.jobPostingId !== "string" || !payload.jobPostingId.trim()) {
      throw new Error("A verified job is required to start a pursuit.");
    }
    const pursuitId = await createPursuit(actor, payload.jobPostingId);
    const starters = await ensurePursuitDocumentStarters(actor, {
      pursuitId,
      jobPostingId: payload.jobPostingId,
    });
    return Response.json({ pursuitId, starters }, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
