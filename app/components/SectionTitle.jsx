export default function SectionTitle({
  eyebrow,
  title,
  description,
  centered = false,
}) {
  return (
    <div className={`mb-12 max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <div
          className={`mb-4 flex items-center gap-3 ${
            centered ? "justify-center" : ""
          }`}
        >
          <span className="h-px w-8 bg-[var(--gold)]" />

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--gold)]">
            {eyebrow}
          </p>

          <span className="h-px w-8 bg-[var(--gold)]" />
        </div>
      )}

      <h2 className="text-4xl font-black leading-tight tracking-tight text-[var(--fg)] md:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-base leading-8 text-[var(--fg-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}
