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
import { buildApplicationPackage } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = (await readBoundedJson(request, 250_000)) as {
      pursuitId?: unknown;
      answers?: unknown;
      includeCoverLetter?: unknown;
    };
    if (
      typeof payload.pursuitId !== "string" ||
      typeof payload.includeCoverLetter !== "boolean"
    ) {
      throw new Error("Choose the active pursuit and exact outbound files.");
    }
    const applicationPackage = await buildApplicationPackage(actor, {
      pursuitId: payload.pursuitId,
      answers: payload.answers,
      includeCoverLetter: payload.includeCoverLetter,
    });
    return Response.json({ applicationPackage }, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
