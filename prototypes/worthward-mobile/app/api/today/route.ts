import { apiErrorResponse } from "../../api-utils";
import {
  requireUserRequest,
  UserAccessError,
  userAuthErrorResponse,
} from "../../server-auth";
import { readToday } from "../../today-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = requireUserRequest(request);
    return Response.json(await readToday(actor), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error, 503);
  }
}
