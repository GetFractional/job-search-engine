import { apiErrorResponse, readBoundedJson, requireSameOrigin } from "../../api-utils";
import type { OnboardingStepPayload } from "../../onboarding-types";
import type { JobStandardRecord } from "../../production-types";
import {
  requireUserRequest,
  UserAccessError,
  userAuthErrorResponse,
} from "../../server-auth";
import {
  readOnboardingState,
  saveOnboardingStep,
} from "../../workspace-repository";

export const dynamic = "force-dynamic";

const GOAL_PRIORITIES = new Set([
  "Earn more",
  "Do work that fits",
  "Get more flexibility",
  "Grow into stronger responsibility",
  "Change career direction",
  "Find more stability",
]);

function text(
  value: unknown,
  label: string,
  maximumLength: number,
  { required = false }: { required?: boolean } = {},
): string {
  if (typeof value !== "string") {
    if (!required && (value === null || value === undefined)) return "";
    throw new Error(`${label} must be text.`);
  }
  const normalized = value.trim();
  if (required && !normalized) throw new Error(`${label} is required.`);
  if (normalized.length > maximumLength) {
    throw new Error(`${label} is longer than this alpha accepts.`);
  }
  return normalized;
}

function optionalDate(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  const normalized = text(value, label, 10, { required: true });
  if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(normalized)) {
    throw new Error(`${label} must use a year and month.`);
  }
  return normalized;
}

function stringList(
  value: unknown,
  label: string,
  maximumItems: number,
  maximumItemLength = 120,
): string[] {
  if (!Array.isArray(value) || value.length > maximumItems) {
    throw new Error(`${label} must be a short list.`);
  }
  const items = value.map((item) =>
    text(item, label, maximumItemLength, { required: true }),
  );
  return [...new Set(items)];
}

function nullableWholeNumber(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new Error(`${label} must be a whole number from ${minimum} to ${maximum}.`);
  }
  return value;
}

function validateJobStandard(
  data: Record<string, unknown>,
): Omit<JobStandardRecord, "id" | "version"> {
  const payBasis = data.payBasis;
  if (payBasis !== "salary" && payBasis !== "hourly" && payBasis !== "either") {
    throw new Error("Choose how you want to compare pay.");
  }
  const minimumPayCents = nullableWholeNumber(
    data.minimumPayCents,
    "Minimum pay",
    0,
    100_000_000,
  );
  const targetPayCents = nullableWholeNumber(
    data.targetPayCents,
    "Target pay",
    0,
    100_000_000,
  );
  if (minimumPayCents === null || targetPayCents === null) {
    throw new Error("Enter both your minimum and target pay.");
  }
  if (targetPayCents < minimumPayCents) {
    throw new Error("Target pay must be at least your minimum pay.");
  }
  return {
    payBasis,
    minimumPayCents,
    targetPayCents,
    currency: "USD",
    workArrangements: stringList(
      data.workArrangements,
      "Work arrangements",
      4,
      40,
    ),
    commuteMiles: nullableWholeNumber(data.commuteMiles, "Commute", 0, 500),
    locations: stringList(data.locations, "Locations", 10, 100),
    travelMaximumPercent: nullableWholeNumber(
      data.travelMaximumPercent,
      "Travel",
      0,
      100,
    ),
    scheduleRequirements:
      text(data.scheduleRequirements, "Schedule needs", 500) || null,
    benefits: stringList(data.benefits, "Benefits", 20, 80),
    growthPriorities: stringList(
      data.growthPriorities,
      "Growth priorities",
      12,
      100,
    ),
    exclusions: stringList(data.exclusions, "Dealbreakers", 20, 120),
  };
}

function validatePayload(value: unknown): OnboardingStepPayload {
  if (!value || typeof value !== "object") {
    throw new Error("A setup step is required.");
  }
  const candidate = value as { step?: unknown; data?: unknown };
  if (
    !Number.isInteger(candidate.step) ||
    (candidate.step as number) < 1 ||
    (candidate.step as number) > 6 ||
    !candidate.data ||
    typeof candidate.data !== "object"
  ) {
    throw new Error("Choose a valid setup step.");
  }
  const step = candidate.step as 1 | 2 | 3 | 4 | 5 | 6;
  const data = candidate.data as Record<string, unknown>;

  if (step === 1) {
    const priorities = stringList(data.priorities, "Priorities", 6, 80);
    if (priorities.some((priority) => !GOAL_PRIORITIES.has(priority))) {
      throw new Error("Choose priorities from the available options.");
    }
    const notes = text(data.notes, "What should change", 500);
    if (priorities.length === 0 && !notes) {
      throw new Error("Choose at least one change or describe what matters.");
    }
    if (data.consentAccepted !== true) {
      throw new Error("Review and accept the alpha data agreement to continue.");
    }
    return { step, data: { priorities, notes, consentAccepted: true } };
  }

  if (step === 2) {
    if (data.method === "paste") {
      const careerText = text(data.careerText, "Career history", 80_000, {
        required: true,
      });
      if (careerText.length < 40) {
        throw new Error("Add a little more career detail so you can review it accurately.");
      }
      return { step, data: { method: "paste", careerText } };
    }
    if (data.method === "file") {
      const contentType = data.contentType;
      if (
        contentType !== "application/pdf" &&
        contentType !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
        contentType !== "text/plain"
      ) {
        throw new Error("Choose a supported PDF, DOCX, or text resume.");
      }
      const parser = data.parser;
      if (
        parser !== "pdfjs-browser-v1" &&
        parser !== "mammoth-browser-v1" &&
        parser !== "text-browser-v1"
      ) {
        throw new Error("The resume parser receipt is not supported.");
      }
      const expectedParser =
        contentType === "application/pdf"
          ? "pdfjs-browser-v1"
          : contentType ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ? "mammoth-browser-v1"
            : "text-browser-v1";
      if (parser !== expectedParser) {
        throw new Error("The resume parser does not match the file type.");
      }
      const clientFileChecksumSha256 = text(
        data.clientFileChecksumSha256,
        "File checksum",
        64,
        { required: true },
      ).toLowerCase();
      if (!/^[a-f0-9]{64}$/.test(clientFileChecksumSha256)) {
        throw new Error("The resume file checksum is not valid.");
      }
      const byteSize = nullableWholeNumber(
        data.byteSize,
        "Resume file size",
        1,
        5 * 1024 * 1024,
      );
      if (byteSize === null) {
        throw new Error("The resume file size is required.");
      }
      const extractedText = text(
        data.extractedText,
        "Extracted resume text",
        80_000,
        { required: true },
      );
      if (extractedText.length < 40) {
        throw new Error(
          "The file did not produce enough text to review accurately.",
        );
      }
      return {
        step,
        data: {
          method: "file",
          originalName: text(
            data.originalName,
            "Resume filename",
            180,
            { required: true },
          ),
          contentType,
          byteSize,
          clientFileChecksumSha256,
          extractedText,
          pageCount: nullableWholeNumber(
            data.pageCount,
            "PDF page count",
            1,
            12,
          ),
          parser,
        },
      };
    }
    if (data.method === "manual") {
      if (!data.role || typeof data.role !== "object") {
        throw new Error("Add at least one role.");
      }
      const role = data.role as Record<string, unknown>;
      const isCurrent = role.isCurrent === true;
      return {
        step,
        data: {
          method: "manual",
          role: {
            employer: text(role.employer, "Employer", 160, { required: true }),
            title: text(role.title, "Job title", 160, { required: true }),
            startDate: optionalDate(role.startDate, "Start date"),
            endDate: isCurrent ? null : optionalDate(role.endDate, "End date"),
            isCurrent,
            location: text(role.location, "Location", 160) || null,
            summary: text(role.summary, "Role details", 4_000) || null,
          },
        },
      };
    }
    throw new Error("Choose whether to paste your career history or add a role.");
  }

  if (step === 3) {
    if (data.confirmed !== true) {
      throw new Error("Confirm that the career information shown is accurate.");
    }
    return { step, data: { confirmed: true } };
  }

  if (step === 4) {
    return { step, data: validateJobStandard(data) };
  }

  if (step === 5) {
    const paths = stringList(data.paths, "Career paths", 5, 80);
    if (paths.length < 1) throw new Error("Add at least one career path.");
    if (
      !Number.isInteger(data.primaryIndex) ||
      (data.primaryIndex as number) < 0 ||
      (data.primaryIndex as number) >= paths.length
    ) {
      throw new Error("Choose one primary career path.");
    }
    return {
      step,
      data: { paths, primaryIndex: data.primaryIndex as number },
    };
  }

  if (data.confirmed !== true) {
    throw new Error("Confirm your search plan before activating the workspace.");
  }
  return { step, data: { confirmed: true } };
}

export async function GET(request: Request) {
  try {
    const actor = requireUserRequest(request);
    const state = await readOnboardingState(actor);
    return Response.json(state, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = validatePayload(await readBoundedJson(request, 100_000));
    const state = await saveOnboardingStep(actor, payload);
    return Response.json(
      { saved: true, state },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
