import {
  apiErrorResponse,
  readBoundedJson,
  requireSameOrigin,
} from "../../api-utils";
import {
  createCoverLetterFromProfile,
  listCoverLetterStudio,
  recordCoverLetterRender,
  saveCoverLetterVersion,
} from "../../document-repository";
import type { CoverLetterStudioRecord } from "../../document-types";
import {
  requireUserRequest,
  UserAccessError,
  userAuthErrorResponse,
} from "../../server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = requireUserRequest(request);
    return Response.json(await listCoverLetterStudio(actor), {
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
    const payload = (await readBoundedJson(request, 250_000)) as {
      action?: unknown;
      pursuitId?: unknown;
      sourceLetterId?: unknown;
      content?: unknown;
      letterId?: unknown;
      format?: unknown;
      filename?: unknown;
      fileSha256?: unknown;
      pageCount?: unknown;
      rendererVersion?: unknown;
    };
    if (typeof payload.pursuitId !== "string" || !payload.pursuitId.trim()) {
      throw new Error("Choose an active pursuit.");
    }
    let letter: CoverLetterStudioRecord;
    if (payload.action === "starter_for_pursuit") {
      letter = await createCoverLetterFromProfile(actor, payload.pursuitId);
    } else if (payload.action === "save_version") {
      letter = await saveCoverLetterVersion(actor, {
        sourceLetterId:
          typeof payload.sourceLetterId === "string"
            ? payload.sourceLetterId
            : null,
        pursuitId: payload.pursuitId,
        content: payload.content,
      });
    } else if (
      payload.action === "record_render" &&
      typeof payload.letterId === "string"
    ) {
      const render = await recordCoverLetterRender(actor, {
        letterId: payload.letterId,
        format: payload.format,
        filename: payload.filename,
        fileSha256: payload.fileSha256,
        pageCount: payload.pageCount,
        rendererVersion: payload.rendererVersion,
      });
      return Response.json({ render }, { status: 201 });
    } else {
      throw new Error("Choose a supported cover-letter action.");
    }
    return Response.json({ letter }, { status: 201 });
  } catch (error) {
    if (error instanceof UserAccessError) return userAuthErrorResponse(error);
    return apiErrorResponse(error);
  }
}
