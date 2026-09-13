"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10">
        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface)] shadow-sm">
            <Image
              src="/logo/logo2.png"
              alt="Artificial Intelligence Engineering Department"
              width={44}
              height={44}
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-black leading-tight text-[var(--fg)]">
              AI Engineering
            </p>

            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
              Mansoura University
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-semibold text-[var(--fg-muted)] transition hover:text-[var(--navy)] dark:hover:text-[var(--gold-light)]"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA + Theme Toggle */}

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          <Link
            href="/project-registration"
            className="rounded-full bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--shadow-color)] transition hover:-translate-y-0.5 hover:bg-[var(--navy-light)]"
          >
            Register Project
          </Link>
        </div>

        {/* Mobile Controls */}

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--navy)] dark:text-[var(--gold)]"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-5 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--fg-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--navy)] dark:hover:text-[var(--gold-light)]"
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/project-registration"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-[var(--navy)] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Register Project
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
