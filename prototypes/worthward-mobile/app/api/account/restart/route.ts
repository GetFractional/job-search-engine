import {
  AccountDataError,
  restartDeletedAccount,
} from "../../../account-repository";
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

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = (await readBoundedJson(request, 2_000)) as {
      confirmation?: unknown;
    };
    const result = await restartDeletedAccount(actor, payload.confirmation);
    return Response.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    if (error instanceof AccountDataError) {
      return Response.json(
        { error: error.message },
        {
          status: error.status,
          headers: { "Cache-Control": "private, no-store" },
        },
      );
    }
    return apiErrorResponse(error, 503);
  }
}
