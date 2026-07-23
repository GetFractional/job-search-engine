import { apiErrorResponse, readBoundedJson, requireSameOrigin } from "../../api-utils";
import { founderAuthErrorResponse, FounderAccessError, requireFounderRequest } from "../../server-auth";
import { approvePursuitPackage } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireFounderRequest(request);
    requireSameOrigin(request);
    const payload = await readBoundedJson(request, 12_000) as {
      packageId?: unknown;
      payloadSha256?: unknown;
      confirmation?: unknown;
    };
    if (typeof payload.packageId !== "string" || typeof payload.payloadSha256 !== "string" || typeof payload.confirmation !== "string") {
      throw new Error("The exact application package is required.");
    }
    const approval = await approvePursuitPackage(
      actor,
      payload.packageId,
      payload.payloadSha256,
      payload.confirmation,
    );
    return Response.json({ approved: true, ...approval }, { status: 201 });
  } catch (error) {
    if (error instanceof FounderAccessError) return founderAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
