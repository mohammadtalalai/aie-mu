import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projects } from "../../lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectDetailsPage({ params }) {
  const { id } = await params;

  const project = projects.find((item) => item.id === id);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 pb-32 pt-40 transition-colors duration-300 md:px-10 md:pt-52">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--gold)] transition hover:text-[var(--fg)]"
        >
          ← Back to Projects
        </Link>

        <div className="mt-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
            Project {project.number}
          </p>

          <h1 className="mt-4 text-4xl font-black text-[var(--fg)] md:text-6xl">
            {project.title}
          </h1>
        </div>

        <div className="relative mt-10 aspect-video overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
              About The Project
            </p>

            <h2 className="mt-3 text-2xl font-bold text-[var(--fg)]">
              Project Overview
            </h2>

            <p className="mt-5 whitespace-pre-line text-base leading-8 text-[var(--fg-muted)]">
              {project.description}
            </p>
          </div>

          <aside className="rounded-3xl border border-[var(--gold)]/20 bg-[var(--surface)] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--gold)]">
              Technology Stack
            </p>

            <h3 className="mt-3 text-xl font-bold text-[var(--fg)]">
              Technologies
            </h3>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.stack.map((tech, index) => (
                <span
                  key={`${project.id}-${tech}-${index}`}
                  className="rounded-full border border-[var(--gold)]/20 bg-[var(--gold-soft)] px-3 py-1.5 text-xs text-[var(--gold)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Team */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--gold)]">
              Team
            </p>

            <h3 className="mt-3 text-xl font-bold text-[var(--fg)]">
              Project Team
            </h3>

            <div className="mt-5 space-y-3">
              {project.team.map((member, index) => (
                <div
                  key={`${project.id}-member-${index}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--fg-muted)]"
                >
                  {member}
                </div>
              ))}
            </div>
          </div>

          {/* Supervisors */}
          <div className="rounded-3xl border border-[var(--gold)]/20 bg-[var(--gold-soft)] p-7">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--gold)]">
              Academic Guidance
            </p>

            <h3 className="mt-3 text-xl font-bold text-[var(--fg)]">
              Supervisors
            </h3>

            <div className="mt-5 space-y-3">
              {project.supervisors.map((supervisor, index) => (
                <div
                  key={`${project.id}-supervisor-${index}`}
                  className="rounded-xl border border-[var(--gold)]/10 bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--fg-muted)]"
                >
                  {supervisor}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
