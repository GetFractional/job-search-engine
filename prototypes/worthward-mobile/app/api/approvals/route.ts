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
import { approvePursuitPackage } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = (await readBoundedJson(request, 20_000)) as {
      packageId?: unknown;
      payloadSha256?: unknown;
      confirmation?: unknown;
      expectedRevision?: unknown;
      attestationVersion?: unknown;
    };
    if (
      typeof payload.packageId !== "string" ||
      typeof payload.payloadSha256 !== "string" ||
      typeof payload.confirmation !== "string" ||
      typeof payload.expectedRevision !== "number" ||
      typeof payload.attestationVersion !== "string"
    ) {
      throw new Error("Review the current exact package before approving it.");
    }
    const approval = await approvePursuitPackage(
      actor,
      payload.packageId,
      payload.payloadSha256,
      payload.confirmation,
      payload.expectedRevision,
      payload.attestationVersion,
    );
    return Response.json({ approval }, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
