const stats = [
  { label: "AI", value: "Artificial Intelligence" },
  { label: "ML", value: "Machine Learning" },
  { label: "CV", value: "Computer Vision" },
  { label: "NLP", value: "Natural Language Processing" },
];

export default function Stats() {
  return (
    <section className="relative border-t border-[var(--border)] bg-[var(--bg-soft)] py-16 transition-colors duration-300">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center text-center"
          >
            <strong className="bg-gradient-to-r from-[var(--navy)] via-[var(--navy-light)] to-[var(--gold)] bg-clip-text text-4xl font-black text-transparent md:text-5xl">
              {stat.label}
            </strong>

            <span className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--fg-muted)]">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
