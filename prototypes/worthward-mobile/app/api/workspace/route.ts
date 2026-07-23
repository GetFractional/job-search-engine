import { founderAuthErrorResponse, requireFounderRequest } from "../../server-auth";
import { readWorkspace } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = requireFounderRequest(request);
    const workspace = await readWorkspace(actor);
    return Response.json(workspace, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof Error && /storage|table|database/i.test(error.message)) {
      return Response.json({ error: "Way Ahead storage is not ready yet." }, { status: 503 });
    }
    return founderAuthErrorResponse(error);
  }
}
