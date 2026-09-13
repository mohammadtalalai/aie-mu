import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-soft)] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo/logo2.png"
                alt="AI Engineering"
                width={50}
                height={50}
                className="h-11 w-11 object-contain"
              />

              <div>
                <p className="font-bold text-[var(--fg)]">AI ENGINEERING</p>

                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-subtle)]">
                  Mansoura University
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-[var(--fg-muted)]">
              Artificial Intelligence Engineering Department, Faculty of
              Engineering, Mansoura University.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-bold text-[var(--fg)]">Navigation</p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-[var(--fg-muted)]">
              <Link href="/" className="transition hover:text-[var(--gold)]">
                Home
              </Link>

              <Link
                href="/about"
                className="transition hover:text-[var(--gold)]"
              >
                About
              </Link>

              <Link
                href="/projects"
                className="transition hover:text-[var(--gold)]"
              >
                Projects
              </Link>

              <Link
                href="/contact"
                className="transition hover:text-[var(--gold)]"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div>
            <p className="text-sm font-bold text-[var(--fg)]">
              Graduation Projects
            </p>

            <p className="mt-5 text-sm leading-7 text-[var(--fg-muted)]">
              Have a project idea? Register your graduation project through
              our online form.
            </p>

            <Link
              href="/project-registration"
              className="mt-5 inline-flex rounded-full border border-[var(--gold)]/30 bg-[var(--gold-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--gold)] transition hover:bg-[var(--gold)] hover:text-[var(--on-gold)]"
            >
              Register Project →
            </Link>
          </div>
        </div>

        <div className="mt-14 border-t border-[var(--border)] pt-8 text-center text-xs text-[var(--fg-subtle)]">
          © 2026 AI Engineering Department · Mansoura University
        </div>
      </div>
    </footer>
  );
}
