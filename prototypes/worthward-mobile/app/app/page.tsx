import { redirect } from "next/navigation";
import WayAheadApp from "../WayAheadApp";
import { requireUserPage } from "../server-auth";
import {
  ensureUser,
  readOnboardingState,
} from "../workspace-repository";

export const dynamic = "force-dynamic";

export default async function ProductHome() {
  const actor = await requireUserPage("/app");
  await ensureUser(actor);
  const onboarding = await readOnboardingState(actor);
  if (!onboarding.complete) {
    redirect(`/app/onboarding?step=${onboarding.currentStep}`);
  }
  return <WayAheadApp actor={actor} />;
}
