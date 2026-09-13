import Image from "next/image";

export default function EventCard({ event }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-500 hover:-translate-y-2 hover:border-[var(--gold)]/50 hover:shadow-xl hover:shadow-[var(--shadow-color)]">
      <div className="relative h-72 overflow-hidden">
        <Image
          src={event.image}
          alt={
            event.title || "Artificial Intelligence Engineering Department Event"
          }
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-[var(--overlay-fade)]" />

        <div className="absolute left-5 top-5">
          <span className="rounded-full border border-[var(--gold)]/30 bg-[var(--bg)]/80 px-4 py-2 text-xs font-semibold text-[var(--gold-light)] backdrop-blur-md">
            {event.date}
          </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="text-xl font-bold leading-tight text-white">
            {event.title}
          </h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm leading-7 text-[var(--fg-muted)]">
          {event.description}
        </p>
      </div>
    </article>
  );
}
