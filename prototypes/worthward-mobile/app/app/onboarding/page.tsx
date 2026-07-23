import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import OnboardingFlow from "../../OnboardingFlow";
import { requireUserPage } from "../../server-auth";
import { readOnboardingState } from "../../workspace-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set up your career search | Way Ahead",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OnboardingPage() {
  const actor = await requireUserPage("/app/onboarding");
  const state = await readOnboardingState(actor);
  if (state.complete) redirect("/app");
  return (
    <OnboardingFlow
      initialState={state}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}
