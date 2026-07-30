import {
  removeCareerEvidenceRole,
  restoreCareerEvidenceRole,
  upsertCareerEvidenceRole,
} from "../../career-evidence-repository";
import { normalizeCareerEvidenceMutation } from "../../career-evidence-types";
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

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const mutation = normalizeCareerEvidenceMutation(
      await readBoundedJson(request, 16_000),
    );
    const result =
      mutation.action === "upsert"
        ? await upsertCareerEvidenceRole(
            actor,
            mutation.roleId,
            mutation.role,
          )
        : mutation.action === "remove"
          ? await removeCareerEvidenceRole(actor, mutation.roleId)
          : await restoreCareerEvidenceRole(actor, mutation.roleId);
    return Response.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
