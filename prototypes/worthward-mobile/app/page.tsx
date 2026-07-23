import WayAheadApp from "./WayAheadApp";
import { FounderAccessError, requireFounderPage } from "./server-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const result = await requireFounderPage("/")
    .then((actor) => ({ actor }))
    .catch((error: unknown) => ({ error }));
  if ("error" in result && result.error instanceof FounderAccessError && result.error.status === 403) {
    return (
      <main className="wa-access-denied">
        <LockMessage />
      </main>
    );
  }
  if ("error" in result) throw result.error;
  return <WayAheadApp actor={result.actor} />;
}

function LockMessage() {
  return (
    <section>
      <p className="wa-eyebrow">Private founder environment</p>
      <h1>This account does not have access.</h1>
      <p>Sign out and use the ChatGPT account authorized for Way Ahead.</p>
      <a className="wa-primary-button" href="/signout-with-chatgpt?return_to=%2F">Sign out</a>
    </section>
  );
}
