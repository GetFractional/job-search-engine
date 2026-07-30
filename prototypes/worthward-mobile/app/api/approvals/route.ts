import { apiErrorResponse, requireSameOrigin } from "../../api-utils";
import { founderAuthErrorResponse, FounderAccessError, requireFounderRequest } from "../../server-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireFounderRequest(request);
    requireSameOrigin(request);
    return Response.json(
      {
        error:
          "Package approval is not enabled in this alpha. Review and export draft assets only.",
      },
      { status: 409 },
    );
  } catch (error) {
    if (error instanceof FounderAccessError) return founderAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
