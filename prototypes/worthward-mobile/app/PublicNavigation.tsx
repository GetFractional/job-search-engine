"use client";

import { ArrowRight, Briefcase, List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./public-site.module.css";

export type PublicNavigationProps = {
  activePage?: "home" | "how-it-works" | "tools";
  primaryHref: string;
  primaryLabel: string;
  signInHref: string;
  signedIn: boolean;
};

const publicLinks = [
  { href: "/how-it-works", label: "How it works", page: "how-it-works" },
  { href: "/tools", label: "Career tools", page: "tools" },
  { href: "/how-it-works#control", label: "Your control", page: "how-it-works" },
] as const;

export default function PublicNavigation({
  activePage = "home",
  primaryHref,
  primaryLabel,
  signInHref,
  signedIn,
}: PublicNavigationProps) {
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
    <>
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
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={activePage === link.page ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
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
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={activePage === link.page ? "page" : undefined}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <a href={signInHref} onClick={closeMenu}>
            {signedIn ? "Workspace" : "Sign in"}
          </a>
          <a className={styles.mobileCta} href={primaryHref} onClick={closeMenu}>
            {primaryLabel}
            <ArrowRight size={18} />
          </a>
        </nav>
      </header>
    </>
  );
}
