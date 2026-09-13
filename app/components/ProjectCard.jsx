import Image from "next/image";
import Link from "next/link";

export default function ProjectCard({ project }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-500 hover:-translate-y-2 hover:border-[var(--gold)]/40 hover:shadow-xl hover:shadow-[var(--shadow-color)]">
      {/* Image */}

      <div className="relative h-64 overflow-hidden">
        <Image
          src={project.image}
          alt={project.title || "AI Engineering Project"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-[var(--overlay-fade)]" />

        <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gold)]/30 bg-[var(--bg)]/80 text-xs font-black text-[var(--gold-light)] backdrop-blur-md">
          {project.number}
        </div>
      </div>

      {/* Content */}

      <div className="p-6">
        <h3 className="text-2xl font-bold text-[var(--fg)]">{project.title}</h3>

        <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-7 text-[var(--fg-muted)]">
          {project.description}
        </p>

        {/* Stack */}

        <div className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((tech, index) => (
            <span
              key={`${project.id}-${tech}-${index}`}
              className="rounded-full border border-[var(--gold)]/20 bg-[var(--gold-soft)] px-3 py-1.5 text-xs font-medium text-[var(--gold)]"
            >
              {tech}
            </span>
          ))}
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)] transition-all hover:gap-3 hover:text-[var(--fg)]"
        >
          View Project
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}
