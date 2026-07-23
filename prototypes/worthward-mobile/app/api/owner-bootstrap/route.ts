import { apiErrorResponse, readBoundedJson, requireSameOrigin } from "../../api-utils";
import { founderAuthErrorResponse, FounderAccessError, requireFounderRequest } from "../../server-auth";
import { bootstrapFounderWorkspace } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireFounderRequest(request);
    requireSameOrigin(request);
    const payload = await readBoundedJson(request, 500_000);
    const receipt = await bootstrapFounderWorkspace(actor, payload);
    return Response.json(receipt, { status: 201 });
  } catch (error) {
    if (error instanceof FounderAccessError) return founderAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
