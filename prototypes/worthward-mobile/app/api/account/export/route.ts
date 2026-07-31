import {
  AccountDataError,
  exportAccountData,
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
    if (payload.confirmation !== "export_my_account") {
      throw new AccountDataError("Confirm the account export request.");
    }
    const exported = await exportAccountData(actor);
    const date = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(exported, null, 2), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="way-ahead-account-export-${date}.json"`,
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
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
