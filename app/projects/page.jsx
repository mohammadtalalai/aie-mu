import SectionTitle from "../components/SectionTitle";
import ProjectCard from "../components/ProjectCard";
import { projects } from "../lib/projects";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 pb-32 pt-40 transition-colors duration-300 md:px-10 md:pt-52">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Student Projects"
          title="Engineering Innovation."
          description="Explore projects developed by students of the Artificial Intelligence Engineering Department, combining engineering principles with modern artificial intelligence technologies."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </main>
  );
}
