import type { Metadata } from "next";
import {
  chatGPTSignInPath,
  getChatGPTUser,
} from "../chatgpt-auth";
import PublicContentPage from "../PublicContentPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How Way Ahead works | Way Ahead",
  description:
    "See the current path from a reviewed Career Profile and Job Standard to preliminary structured-field alignment, Pursuit controls, editable application materials, and exact approval.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HowItWorks() {
  const user = await getChatGPTUser();
  const signedIn = Boolean(user);
  const workspaceHref = signedIn
    ? "/app/home"
    : chatGPTSignInPath("/app/home");

  return (
    <PublicContentPage
      kind="how-it-works"
      primaryHref={workspaceHref}
      primaryLabel={signedIn ? "Open workspace" : "Get started"}
      signInHref={workspaceHref}
      signedIn={signedIn}
    />
  );
}
