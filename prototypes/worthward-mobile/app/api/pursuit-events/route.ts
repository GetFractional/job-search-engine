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
import { recordPursuitEvent } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = (await readBoundedJson(request, 80_000)) as {
      pursuitId?: unknown;
      type?: unknown;
      occurredAt?: unknown;
      note?: unknown;
      metadata?: unknown;
      confirmation?: unknown;
    };
    if (typeof payload.pursuitId !== "string") {
      throw new Error("Choose an active pursuit.");
    }
    const event = await recordPursuitEvent(actor, {
      pursuitId: payload.pursuitId,
      type: payload.type,
      occurredAt: payload.occurredAt,
      note: payload.note,
      metadata: payload.metadata,
      confirmation: payload.confirmation,
    });
    return Response.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
