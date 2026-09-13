import Link from "next/link";

import Hero from "./components/Hero";
import Stats from "./components/Stats";
import SectionTitle from "./components/SectionTitle";
import EventCarousel from "./components/EventCarousel";
import ProjectCard from "./components/ProjectCard";

import { events } from "./lib/events";
import { projects } from "./lib/projects";

export default function Home() {
  return (
    <>
      <Hero />

      <Stats />

      {/* =====================================================
          EVENTS
      ===================================================== */}

      <section className="relative border-t border-[var(--border)] bg-[var(--bg)] py-28 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle
            eyebrow="Events & Activities"
            title="Department Highlights."
            description="Discover academic activities, competitions, workshops, student initiatives, and achievements within the Artificial Intelligence Engineering Department."
          />

          <EventCarousel events={events} />
        </div>
      </section>

      {/* =====================================================
          PROJECTS
      ===================================================== */}

      <section className="relative border-t border-[var(--border)] bg-[var(--bg)] py-28 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionTitle
              eyebrow="Student Projects"
              title="Engineering Innovation."
              description="Explore selected projects developed by Artificial Intelligence Engineering students, combining engineering principles with modern AI technologies."
            />

            <Link
              href="/projects"
              className="shrink-0 text-sm font-semibold text-[var(--gold)] transition hover:text-[var(--fg)]"
            >
              View All Projects →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="relative border-t border-[var(--border)] bg-[var(--bg)] py-28 transition-colors duration-300">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--gold)]/20 bg-[var(--surface)] p-10 text-center shadow-sm md:p-16">
            <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-[var(--gold)]/10 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                Artificial Intelligence Engineering
              </p>

              <h2 className="mt-5 text-3xl font-black text-[var(--fg)] md:text-5xl">
                Build the Future with Intelligence.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-8 text-[var(--fg-muted)]">
                Explore our department, discover student projects,
                participate in activities, and become part of an
                engineering community focused on innovation and impact.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/about"
                  className="rounded-full bg-[var(--navy)] px-7 py-3.5 font-semibold text-white transition hover:bg-[var(--navy-light)]"
                >
                  About the Department
                </Link>

                <Link
                  href="/contact"
                  className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-soft)] px-7 py-3.5 font-semibold text-[var(--fg)] transition hover:border-[var(--gold)]/30 hover:bg-[var(--gold-soft)]"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
