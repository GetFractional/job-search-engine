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
import { markPursuitAssetClaimSafe } from "../../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = (await readBoundedJson(request, 20_000)) as {
      assetId?: unknown;
      confirmation?: unknown;
    };
    if (
      typeof payload.assetId !== "string" ||
      typeof payload.confirmation !== "string"
    ) {
      throw new Error("Choose the exact rendered application file.");
    }
    const review = await markPursuitAssetClaimSafe(
      actor,
      payload.assetId,
      payload.confirmation,
    );
    return Response.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
