import {
  apiErrorResponse,
  readBoundedJson,
  requireSameOrigin,
} from "../../api-utils";
import {
  requireUserRequest,
  UserAccessError,
  userAuthErrorResponse,
} from "../../server-auth";
import { recordOwnerOpportunityAnalysis } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = await readBoundedJson(request, 30_000);
    const result = await recordOwnerOpportunityAnalysis(
      actor,
      payload as Parameters<typeof recordOwnerOpportunityAnalysis>[1],
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
