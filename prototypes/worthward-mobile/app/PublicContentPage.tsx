"use client";

import {
  ArrowRight,
  Briefcase,
  FileText,
  ListChecks,
  ShieldCheck,
} from "@phosphor-icons/react";
import PublicNavigation from "./PublicNavigation";
import styles from "./public-site.module.css";

type PublicContentPageProps = {
  kind: "how-it-works" | "tools";
  primaryHref: string;
  primaryLabel: string;
  signInHref: string;
  signedIn: boolean;
};

const journey = [
  {
    title: "Create your private workspace",
    body: "Sign in to a self-service account. Each member has a separate workspace and must complete setup before the job-search dashboard opens.",
  },
  {
    title: "Build a reviewed Career Profile",
    body: "Import a PDF, DOCX, or text resume, or enter experience directly. Imported text stays unconfirmed until you review the structured role facts Way Ahead can rely on.",
  },
  {
    title: "Define your Job Standard and Job Paths",
    body: "Set the pay, work arrangement, commute, travel, benefits, and dealbreakers that make a job worth pursuing. Organize different role directions as separate Job Paths.",
  },
  {
    title: "Add a current employer job",
    body: "Paste a direct canonical employer URL. Current live intake verifies Greenhouse, Lever, and Ashby job pages; broader job discovery, monitoring, and alert feeds are not live yet.",
  },
  {
    title: "Review preliminary structured-field alignment",
    body: "Check title-to-path alignment, Job Standard match, source readiness, freshness, and profile readiness. Requirement-level comparison between the job and your career evidence is not live, so the current release blocks a pursue recommendation.",
  },
  {
    title: "Choose what becomes a Pursuit",
    body: "Move a reviewed job into an active Pursuit only when the evidence supports the effort. The workspace keeps the source, next action, risks, and document work connected.",
  },
  {
    title: "Draft and revise application materials",
    body: "Use Resume and Cover Letter Studio to create profile-based starters, edit content and design, save versions, and export drafts. Member-facing claim-safe review, package construction, and approval are not live in this alpha.",
  },
] as const;

const tools = [
  {
    icon: ListChecks,
    name: "Guided setup",
    availability: "Available",
    body: "A six-step flow for resume intake, structured experience confirmation, Job Standard, Job Paths, and a final review.",
  },
  {
    icon: Briefcase,
    name: "Career Profile",
    availability: "Available, still expanding",
    body: "A member-owned evidence record where you can add, edit, confirm, remove, and restore multiple structured roles. Skills and individual evidence-item editing are still being expanded.",
  },
  {
    icon: ListChecks,
    name: "Job Standard and Job Paths",
    availability: "Available",
    body: "Separate the conditions a job must meet from the role directions you are willing to pursue, including multiple paths.",
  },
  {
    icon: Briefcase,
    name: "Employer job intake",
    availability: "Greenhouse, Lever, and Ashby",
    body: "Verify and store current job-source versions from direct Greenhouse, Lever, or Ashby employer URLs. Application questions are captured only when the source exposes them.",
  },
  {
    icon: ShieldCheck,
    name: "Preliminary structured alignment",
    availability: "Available, recommendation blocked",
    body: "Check title-to-path alignment, Job Standard match, source readiness, freshness, and profile readiness. Requirement-level evidence comparison is not live, so the current release does not make a pursue recommendation.",
  },
  {
    icon: ListChecks,
    name: "Home scoreboard and Pursuits",
    availability: "Available",
    body: "Compare supported jobs by Job Path, keep next actions visible, and carry selected jobs into a connected Pursuit workspace.",
  },
  {
    icon: FileText,
    name: "Resume Studio",
    availability: "Available",
    body: "Create and edit master, Job Path, or job-assigned resumes; change layout choices; save immutable versions; and export the version you select.",
  },
  {
    icon: FileText,
    name: "Cover Letter Studio",
    availability: "Available with a tailoring gate",
    body: "Create a profile-based starter for an active Pursuit, edit every paragraph, save versions, and export. Posting requirements are not used automatically in the current starter.",
  },
] as const;

function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <span>Way Ahead</span>
      <p>
        Public alpha. No outcome guarantee, billing, outreach, or application
        submission is enabled.
      </p>
    </footer>
  );
}

function PageCta({
  primaryHref,
  primaryLabel,
}: Pick<PublicContentPageProps, "primaryHref" | "primaryLabel">) {
  return (
    <a className={styles.primaryButton} href={primaryHref}>
      {primaryLabel}
      <ArrowRight size={19} weight="bold" />
    </a>
  );
}

function HowItWorksPage({
  primaryHref,
  primaryLabel,
}: Pick<PublicContentPageProps, "primaryHref" | "primaryLabel">) {
  return (
    <>
      <section className={`${styles.hero} ${styles.contentHero}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>How Way Ahead works</p>
          <h1>Turn scattered career facts into a job pursuit you can trust.</h1>
          <p className={styles.lede}>
            Way Ahead connects what you have done, what your next job must
            deliver, the employer&apos;s current source, and the exact materials
            you choose to use.
          </p>
          <div className={styles.heroActions}>
            <PageCta primaryHref={primaryHref} primaryLabel={primaryLabel} />
            <a className={styles.textLink} href="/tools">
              Review the current tools
            </a>
          </div>
        </div>
        <aside className={styles.truthCard} aria-label="Current alpha boundary">
          <ShieldCheck size={30} weight="duotone" aria-hidden="true" />
          <p className={styles.cardLabel}>The boundary is part of the product</p>
          <h2>You decide what becomes external.</h2>
          <p>
            Way Ahead can organize evidence, check preliminary structured-field
            alignment for supported jobs, and prepare editable documents. It
            cannot populate an employer form, upload files, send outreach, or
            submit an application in this release.
          </p>
        </aside>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>The current member journey</p>
          <h2>One connected path from first sign-in to editable drafts.</h2>
          <p>
            Every stage preserves its source and open questions so a polished
            answer never outruns the evidence behind it.
          </p>
        </div>
        <ol className={styles.journeyGrid}>
          {journey.map((step, index) => (
            <li key={step.title}>
              <span aria-hidden="true">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.controlSection} id="control">
        <ShieldCheck size={34} weight="duotone" aria-hidden="true" />
        <div>
          <p className={styles.eyebrow}>Control and claim safety</p>
          <h2>The system shows uncertainty instead of inventing certainty.</h2>
          <p>
            Preliminary scores are shown only when tied to the current
            employer-source version. Requirement-level evidence comparison is
            not live and blocks a pursue recommendation. Imported experience
            needs member confirmation. Document versions remain editable. The
            current alpha stops before claim-safe package construction or
            member approval.
          </p>
        </div>
      </section>

      <section className={styles.limitSection} aria-labelledby="alpha-limits">
        <div>
          <p className={styles.eyebrow}>What is not live yet</p>
          <h2 id="alpha-limits">Know the alpha limits before you start.</h2>
        </div>
        <ul>
          <li>No automated broad job discovery, monitoring feed, or email alerts.</li>
          <li>No live model-powered generation; current starters are profile-based.</li>
          <li>No claim-safe package construction or member approval workflow.</li>
          <li>No billing, paid plan, partner referral, or public price is enabled.</li>
          <li>No outreach, employer-form population, file upload, or submission.</li>
          <li>No promise of an interview, offer, compensation, or other outcome.</li>
        </ul>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>Start with the truth</p>
          <h2>Build the workspace before the next application takes your time.</h2>
        </div>
        <PageCta primaryHref={primaryHref} primaryLabel={primaryLabel} />
      </section>
    </>
  );
}

function ToolsPage({
  primaryHref,
  primaryLabel,
}: Pick<PublicContentPageProps, "primaryHref" | "primaryLabel">) {
  return (
    <>
      <section className={`${styles.hero} ${styles.contentHero}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Current career tools</p>
          <h1>A working system for deciding, preparing, and staying in control.</h1>
          <p className={styles.lede}>
            These are the member tools available in the current alpha. They use
            your own reviewed information and supported employer sources; they
            are not placeholder calculators or pretend automations.
          </p>
          <div className={styles.heroActions}>
            <PageCta primaryHref={primaryHref} primaryLabel={primaryLabel} />
            <a className={styles.textLink} href="/how-it-works">
              Follow the member journey
            </a>
          </div>
        </div>
        <aside className={styles.truthCard} aria-label="Supported job sources">
          <Briefcase size={30} weight="duotone" aria-hidden="true" />
          <p className={styles.cardLabel}>Live source support</p>
          <h2>Direct Greenhouse, Lever, and Ashby employer URLs.</h2>
          <p>
            Current intake verifies canonical job content from those three
            public employer ATS sources. Application questions are captured
            only when the source exposes them, currently Greenhouse. Other job
            boards and employer sites are not supported by live intake yet.
          </p>
        </aside>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Inside the member workspace</p>
          <h2>Tools that share one source of career truth.</h2>
          <p>
            The same confirmed profile, Job Standard, Job Paths, and employer
            source stay connected as a job moves from consideration to Pursuit.
          </p>
        </div>
        <div className={styles.toolCardGrid}>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <article key={tool.name}>
                <div className={styles.toolCardHeader}>
                  <Icon size={27} weight="duotone" aria-hidden="true" />
                  <span>{tool.availability}</span>
                </div>
                <h3>{tool.name}</h3>
                <p>{tool.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.limitSection} aria-labelledby="tool-boundaries">
        <div>
          <p className={styles.eyebrow}>Bounded on purpose</p>
          <h2 id="tool-boundaries">A missing capability is never disguised as automation.</h2>
        </div>
        <div>
          <p>
            Broad job ingestion, scheduled alerts, live AI generation, employer
            form staging, file upload, outreach, application submission,
            billing, and outcome analytics are not live in this alpha.
          </p>
          <p>
            The current release stops at editable draft versions. It does not
            yet create a claim-safe package or record member approval. External
            action remains outside the product.
          </p>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>Use the working system</p>
          <h2>Start with your Career Profile and Job Standard.</h2>
        </div>
        <PageCta primaryHref={primaryHref} primaryLabel={primaryLabel} />
      </section>
    </>
  );
}

export default function PublicContentPage({
  kind,
  primaryHref,
  primaryLabel,
  signInHref,
  signedIn,
}: PublicContentPageProps) {
  return (
    <div className={styles.site}>
      <PublicNavigation
        activePage={kind}
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
        signInHref={signInHref}
        signedIn={signedIn}
      />
      <main id="public-main" tabIndex={-1}>
        {kind === "how-it-works" ? (
          <HowItWorksPage
            primaryHref={primaryHref}
            primaryLabel={primaryLabel}
          />
        ) : (
          <ToolsPage primaryHref={primaryHref} primaryLabel={primaryLabel} />
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
