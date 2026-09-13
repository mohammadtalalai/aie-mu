"use client";

import { useEffect, useState } from "react";
import EventCard from "./EventCard";

export default function EventCarousel({ events = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-10 text-center">
        <p className="text-[var(--fg-muted)]">No events available at the moment.</p>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % events.length);
  };

  const previousSlide = () => {
    setCurrent((prev) => (prev - 1 + events.length) % events.length);
  };

  const visibleEvents = [];

  for (let i = 0; i < Math.min(3, events.length); i++) {
    visibleEvents.push(events[(current + i) % events.length]);
  }

  return (
    <div>
      {/* Controls */}

      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous event"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-lg text-[var(--gold)] backdrop-blur transition-all duration-300 hover:border-[var(--gold)]/50 hover:bg-[var(--gold-soft)] hover:text-[var(--fg)]"
        >
          ←
        </button>

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
            Latest Activities
          </p>
        </div>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next event"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-lg text-[var(--gold)] backdrop-blur transition-all duration-300 hover:border-[var(--gold)]/50 hover:bg-[var(--gold-soft)] hover:text-[var(--fg)]"
        >
          →
        </button>
      </div>

      {/* Events */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Pagination */}

      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2">
          {events.map((event, index) => (
            <button
              type="button"
              key={event.id}
              onClick={() => setCurrent(index)}
              aria-label={`Go to event ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === index
                  ? "w-10 bg-[var(--gold)]"
                  : "w-2 bg-[var(--border-strong)] hover:bg-[var(--fg-subtle)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
