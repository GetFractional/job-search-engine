import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import OnboardingFlow from "../../../OnboardingFlow";
import { requireUserPage } from "../../../server-auth";
import {
  deletedAccountNeedsRestart,
  readOnboardingState,
} from "../../../workspace-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Update your experience | Way Ahead",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ExperienceProfilePage() {
  const actor = await requireUserPage("/app/onboarding/experience");
  if (await deletedAccountNeedsRestart(actor)) redirect("/app/home");
  const state = await readOnboardingState(actor);
  return (
    <OnboardingFlow
      initialState={state}
      signOutHref={chatGPTSignOutPath("/")}
      editMode="experience"
    />
  );
}
