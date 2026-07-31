import { apiErrorResponse, readBoundedJson, requireSameOrigin } from "../../api-utils";
import type { JobStandardRecord } from "../../production-types";
import { founderAuthErrorResponse, FounderAccessError, requireFounderRequest } from "../../server-auth";
import { saveJobStandard } from "../../workspace-repository";

export const dynamic = "force-dynamic";

function validateStandard(value: unknown): Omit<JobStandardRecord, "id" | "version"> {
  if (!value || typeof value !== "object") throw new Error("A job standard is required.");
  const input = value as Omit<JobStandardRecord, "id" | "version">;
  if (!input.payBasis || !["salary", "hourly", "either"].includes(input.payBasis)) {
    throw new Error("Choose a valid pay basis.");
  }
  if (!Number.isInteger(input.minimumPayCents) || (input.minimumPayCents ?? 0) < 0) {
    throw new Error("Minimum pay must be a non-negative whole amount.");
  }
  if (!Number.isInteger(input.targetPayCents) || (input.targetPayCents ?? 0) < (input.minimumPayCents ?? 0)) {
    throw new Error("Target pay must be at least the minimum pay.");
  }
  for (const field of [
    input.workArrangements,
    input.locations,
    input.benefits,
    input.growthPriorities,
    input.exclusions,
  ]) {
    if (!Array.isArray(field) || field.some((item) => typeof item !== "string")) {
      throw new Error("Job standard list values must be text.");
    }
  }
  if (input.commuteMiles !== null && (!Number.isInteger(input.commuteMiles) || input.commuteMiles < 0 || input.commuteMiles > 500)) {
    throw new Error("Commute distance must be between 0 and 500 miles.");
  }
  return input;
}

export async function PUT(request: Request) {
  try {
    const actor = requireFounderRequest(request);
    requireSameOrigin(request);
    const standard = validateStandard(await readBoundedJson(request, 25_000));
    await saveJobStandard(actor, standard);
    return Response.json({ saved: true, dependentAnalysisInvalidated: true });
  } catch (error) {
    if (error instanceof FounderAccessError) return founderAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
