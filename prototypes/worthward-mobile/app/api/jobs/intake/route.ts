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
import { ingestEmployerJob } from "../../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = (await readBoundedJson(request, 15_000)) as {
      url?: unknown;
    };
    if (typeof payload.url !== "string" || payload.url.length > 2_000) {
      throw new Error("Enter a direct employer job URL.");
    }
    const result = await ingestEmployerJob(actor, payload.url);
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
