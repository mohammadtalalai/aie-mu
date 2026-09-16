export default function ContactPage() {
  return (
    <section className="min-h-screen bg-[var(--bg)] px-6 pb-28 pt-40 transition-colors duration-300">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
              Contact
            </p>

            <h1 className="mt-5 text-5xl font-black tracking-tight text-[var(--fg)]">
              Let&apos;s connect.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--fg-muted)]">
              Have a question about the department, graduation projects or
              academic activities? Get in touch with us.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <p className="text-xs uppercase tracking-wider text-[var(--fg-subtle)]">
                  Email
                </p>

                <p className="mt-2 text-[var(--fg-secondary)]">ai@mans.edu.eg</p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <p className="text-xs uppercase tracking-wider text-[var(--fg-subtle)]">
                  Location
                </p>

                <p className="mt-2 text-[var(--fg-secondary)]">
                  Faculty of Engineering, Mansoura University
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:p-10">
            <h2 className="text-2xl font-bold text-[var(--fg)]">
              Send a message
            </h2>

            <form className="mt-8 space-y-5">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 text-[var(--fg)] outline-none transition placeholder:text-[var(--fg-subtle)] focus:border-[var(--gold)]"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 text-[var(--fg)] outline-none transition placeholder:text-[var(--fg-subtle)] focus:border-[var(--gold)]"
              />

              <textarea
                rows="6"
                placeholder="Your Message"
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 text-[var(--fg)] outline-none transition placeholder:text-[var(--fg-subtle)] focus:border-[var(--gold)]"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--navy)] px-6 py-4 font-bold text-white transition hover:bg-[var(--navy-light)]"
              >
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
