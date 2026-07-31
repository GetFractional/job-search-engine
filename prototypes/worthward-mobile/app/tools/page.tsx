import type { Metadata } from "next";
import {
  chatGPTSignInPath,
  getChatGPTUser,
} from "../chatgpt-auth";
import PublicContentPage from "../PublicContentPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Career tools | Way Ahead",
  description:
    "Review the member tools available in Way Ahead's current public alpha, including bounded employer-source support and exact external-action controls.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Tools() {
  const user = await getChatGPTUser();
  const signedIn = Boolean(user);
  const workspaceHref = signedIn
    ? "/app/home"
    : chatGPTSignInPath("/app/home");

  return (
    <PublicContentPage
      kind="tools"
      primaryHref={workspaceHref}
      primaryLabel={signedIn ? "Open workspace" : "Get started"}
      signInHref={workspaceHref}
      signedIn={signedIn}
    />
  );
}
