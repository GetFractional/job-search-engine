import {
  apiErrorResponse,
  readBoundedJson,
  requireSameOrigin,
} from "../../api-utils";
import {
  createBlankResume,
  createResumeFromProfile,
  listResumeStudio,
  recordResumeRender,
  saveResumeVersion,
} from "../../document-repository";
import type { ResumeStudioRecord } from "../../document-types";
import {
  requireUserRequest,
  UserAccessError,
  userAuthErrorResponse,
} from "../../server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = requireUserRequest(request);
    return Response.json(await listResumeStudio(actor), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error, 503);
  }
}

export async function POST(request: Request) {
  try {
    const actor = requireUserRequest(request);
    requireSameOrigin(request);
    const payload = (await readBoundedJson(request, 400_000)) as {
      action?: unknown;
      sourceResumeId?: unknown;
      name?: unknown;
      kind?: unknown;
      content?: unknown;
      assignment?: unknown;
      resumeId?: unknown;
      format?: unknown;
      filename?: unknown;
      fileSha256?: unknown;
      pageCount?: unknown;
      rendererVersion?: unknown;
    };
    let resume: ResumeStudioRecord;
    if (payload.action === "starter_from_profile") {
      resume = await createResumeFromProfile(actor);
    } else if (payload.action === "create_blank") {
      resume = await createBlankResume(actor);
    } else if (payload.action === "save_version") {
      if (
        typeof payload.name !== "string" ||
        (payload.kind !== "master" &&
          payload.kind !== "path" &&
          payload.kind !== "job")
      ) {
        throw new Error("Resume name and use are required.");
      }
      const assignment =
        payload.assignment && typeof payload.assignment === "object"
          ? (payload.assignment as {
              scope?: unknown;
              careerPathId?: unknown;
              jobPostingId?: unknown;
            })
          : {};
      const expectedScope =
        payload.kind === "master"
          ? "default"
          : payload.kind === "path"
            ? "path"
            : "job";
      if (assignment.scope !== expectedScope) {
        throw new Error("The resume assignment does not match its selected use.");
      }
      resume = await saveResumeVersion(actor, {
        sourceResumeId:
          typeof payload.sourceResumeId === "string"
            ? payload.sourceResumeId
            : null,
        name: payload.name,
        kind: payload.kind,
        content: payload.content,
        assignment: {
          scope: expectedScope,
          careerPathId:
            typeof assignment.careerPathId === "string"
              ? assignment.careerPathId
              : null,
          jobPostingId:
            typeof assignment.jobPostingId === "string"
              ? assignment.jobPostingId
              : null,
        },
      });
    } else if (
      payload.action === "record_render" &&
      typeof payload.resumeId === "string"
    ) {
      const render = await recordResumeRender(actor, {
        resumeId: payload.resumeId,
        format: payload.format,
        filename: payload.filename,
        fileSha256: payload.fileSha256,
        pageCount: payload.pageCount,
        rendererVersion: payload.rendererVersion,
      });
      return Response.json({ render }, { status: 201 });
    } else {
      throw new Error("Choose a supported resume action.");
    }
    return Response.json({ resume }, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
