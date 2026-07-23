import type { Metadata } from "next";
import PublicSite from "./PublicSite";
import {
  chatGPTSignInPath,
  getChatGPTUser,
} from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Way Ahead | Find jobs worth pursuing",
  description:
    "Define a better move, focus on current jobs worth your effort, and build a stronger truthful application.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Home() {
  const user = await getChatGPTUser();
  const signedIn = Boolean(user);
  return (
    <PublicSite
      primaryHref={signedIn ? "/app" : chatGPTSignInPath("/app")}
      primaryLabel={signedIn ? "Open workspace" : "Get started"}
      signInHref={signedIn ? "/app" : chatGPTSignInPath("/app")}
      signedIn={signedIn}
    />
  );
}
