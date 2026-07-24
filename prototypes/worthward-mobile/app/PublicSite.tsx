"use client";

import {
  ArrowRight,
  Briefcase,
  FileText,
  ListChecks,
  List,
  ShieldCheck,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./public-site.module.css";

type PublicSiteProps = {
  primaryHref: string;
  primaryLabel: string;
  signInHref: string;
  signedIn: boolean;
};

export default function PublicSite({
  primaryHref,
  primaryLabel,
  signInHref,
  signedIn,
}: PublicSiteProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.site}>
      <a className={styles.skipLink} href="#public-main">
        Skip to main content
      </a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Way Ahead home">
          <span className={styles.brandMark} aria-hidden="true">
            <Briefcase size={20} weight="duotone" />
          </span>
          Way Ahead
        </Link>

        <nav className={styles.desktopNav} aria-label="Public navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#career-tools">Career tools</a>
          <a href="#trust">Your control</a>
        </nav>

        <div className={styles.headerActions}>
          <a className={styles.signInLink} href={signInHref}>
            {signedIn ? "Workspace" : "Sign in"}
          </a>
          <a className={styles.headerCta} href={primaryHref}>
            {primaryLabel}
          </a>
          <button
            ref={menuButtonRef}
            className={styles.menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>

        <nav
          id="public-mobile-menu"
          className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
          aria-label="Mobile navigation"
          hidden={!menuOpen}
        >
          <a href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>
          <a href="#career-tools" onClick={closeMenu}>
            Career tools
          </a>
          <a href="#trust" onClick={closeMenu}>
            Your control
          </a>
          <a href={signInHref} onClick={closeMenu}>
            {signedIn ? "Workspace" : "Sign in"}
          </a>
          <a className={styles.mobileCta} href={primaryHref} onClick={closeMenu}>
            {primaryLabel}
            <ArrowRight size={18} />
          </a>
        </nav>
      </header>

      <main id="public-main" tabIndex={-1}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Career search, built around you</p>
            <h1>Stop wasting your best effort on jobs that are not worth it.</h1>
            <p className={styles.lede}>
              Way Ahead learns what you are good at and what your next job must
              deliver, finds current jobs worth pursuing, and helps you build
              the strongest truthful application for each one.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href={primaryHref}>
                {primaryLabel === "Open workspace"
                  ? primaryLabel
                  : "Find jobs worth pursuing"}
                <ArrowRight size={19} weight="bold" />
              </a>
              <a className={styles.textLink} href="#how-it-works">
                See how it works
              </a>
            </div>
            <p className={styles.trustLine}>
              <ShieldCheck size={20} weight="duotone" aria-hidden="true" />
              Private by default. No invented experience. Nothing sent without
              your approval.
            </p>
          </div>

          <aside className={styles.decisionCard} aria-label="Way Ahead outcome">
            <p className={styles.cardLabel}>Your next job, made clearer</p>
            <div>
              <span>1</span>
              <p>
                <strong>Define the job you want.</strong>
                Tell Way Ahead what must improve and what is non-negotiable.
              </p>
            </div>
            <div>
              <span>2</span>
              <p>
                <strong>See what deserves effort.</strong>
                Compare current jobs by role family, evidence, and how well
                each one meets your standard.
              </p>
            </div>
            <div>
              <span>3</span>
              <p>
                <strong>Build the honest case.</strong>
                Prepare job-specific materials you can review and edit before
                anything leaves the workspace.
              </p>
            </div>
          </aside>
        </section>

        <section className={styles.section} id="how-it-works">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>A simpler way through the search</p>
            <h2>Know where to focus before another application takes your night.</h2>
            <p>
              Start with your real experience and standards. Way Ahead organizes
              the work around the Job Paths you choose, then shows what is
              known, what is missing, and what to do next.
            </p>
          </div>
          <div className={styles.featureGrid}>
            <article>
              <ListChecks size={27} weight="duotone" />
              <h3>Your definition of worth it</h3>
              <p>
                Pay, flexibility, location, benefits, growth, and dealbreakers
                stay visible while you compare roles.
              </p>
            </article>
            <article>
              <Briefcase size={27} weight="duotone" />
              <h3>Multiple Job Paths</h3>
              <p>
                Keep separate scoreboards for the directions you are exploring
                without flattening them into one generic search.
              </p>
            </article>
            <article>
              <FileText size={27} weight="duotone" />
              <h3>Application materials you control</h3>
              <p>
                Build from verified career facts, edit the result, and approve
                the exact version. Employer-facing action remains separate.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.splitSection} id="career-tools">
          <div>
            <p className={styles.eyebrow}>One career record, useful everywhere</p>
            <h2>Do the hard thinking once. Reuse it without losing the truth.</h2>
          </div>
          <div className={styles.toolList}>
            <p>
              <strong>Career Profile</strong>
              A reviewed record of your experience, skills, and proof.
            </p>
            <p>
              <strong>Opportunity Scoreboards</strong>
              Current jobs organized by the Job Paths you actually want.
            </p>
            <p>
              <strong>Resume and Cover Letter Studios</strong>
              Master, Job Path, and job-specific materials with user editing
              and version control.
            </p>
          </div>
        </section>

        <section className={styles.controlSection} id="trust">
          <ShieldCheck size={34} weight="duotone" aria-hidden="true" />
          <div>
            <p className={styles.eyebrow}>Your information. Your decision.</p>
            <h2>AI can do the heavy lifting without taking away your control.</h2>
            <p>
              Way Ahead is designed to show source status, preserve unknowns,
              ask you to correct important facts, and stop before outreach or
              application submission. Model-powered generation is not enabled
              in this alpha until its privacy, quality, and cost gates pass.
            </p>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div>
            <p className={styles.eyebrow}>Make the next effort count</p>
            <h2>Find the next job you actually want.</h2>
          </div>
          <a className={styles.primaryButton} href={primaryHref}>
            {primaryLabel}
            <ArrowRight size={19} weight="bold" />
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Way Ahead</span>
        <p>
          Public alpha. No outcome guarantee, billing, outreach, or application
          submission is enabled.
        </p>
      </footer>
    </div>
  );
}
