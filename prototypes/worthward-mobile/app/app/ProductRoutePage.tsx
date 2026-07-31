import { redirect } from "next/navigation";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { DeletedAccountRestart } from "../DeletedAccountRestart";
import WayAheadApp, {
  type StudioKey,
  type ViewKey,
} from "../WayAheadApp";
import { requireUserPage } from "../server-auth";
import {
  deletedAccountNeedsRestart,
  ensureUser,
  readOnboardingState,
} from "../workspace-repository";

type ProductRoutePageProps = {
  returnPath: string;
  view: ViewKey;
  jobId?: string | null;
  studio?: StudioKey;
  documentId?: string | null;
};

export async function ProductRoutePage({
  returnPath,
  view,
  jobId = null,
  studio = "resume",
  documentId = null,
}: ProductRoutePageProps) {
  const actor = await requireUserPage(returnPath);
  if (await deletedAccountNeedsRestart(actor)) {
    return <DeletedAccountRestart signOutHref={chatGPTSignOutPath("/")} />;
  }
  await ensureUser(actor);
  const onboarding = await readOnboardingState(actor);
  if (!onboarding.complete) {
    redirect(`/app/onboarding?step=${onboarding.currentStep}`);
  }
  return (
    <WayAheadApp
      actor={actor}
      initialJobId={jobId}
      initialDocumentId={documentId}
      initialStudio={studio}
      initialView={view}
    />
  );
}
