import type { Metadata } from "next";
import Link from "next/link";
import OwnerBootstrapForm from "../OwnerBootstrapForm";
import { requireUserPage } from "../server-auth";
import { ensureFounder } from "../workspace-repository";
import styles from "../onboarding.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner workspace import | Way Ahead",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OwnerBootstrapPage() {
  const actor = await requireUserPage("/owner-bootstrap");
  await ensureFounder(actor);

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">Skip to main content</a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/app/home">
          <span className={styles.brandMark} aria-hidden="true">W</span>
          Way Ahead
        </Link>
        <span className={styles.headerContext}>Owner import</span>
        <div />
      </header>
      <OwnerBootstrapForm />
    </div>
  );
}
