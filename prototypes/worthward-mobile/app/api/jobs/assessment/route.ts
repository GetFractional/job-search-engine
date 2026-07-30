import {
  apiErrorResponse,
  readBoundedJson,
  requireSameOrigin,
} from "../../../api-utils";
import {
  requireUserRequest,
  UserAccessError,
  userAuthErrorResponse,
} from "../../../server-auth";
import { recordMemberOpportunityAssessment } from "../../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = (await readBoundedJson(request, 10_000)) as {
      jobPostingId?: unknown;
      careerPathId?: unknown;
    };
    const result = await recordMemberOpportunityAssessment(actor, {
      jobPostingId: payload.jobPostingId,
      careerPathId: payload.careerPathId,
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
