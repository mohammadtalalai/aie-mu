import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--bg)] transition-colors duration-300">
      {/* Background */}

      <div className="absolute left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-[var(--navy)]/5 blur-3xl" />

      <div className="absolute right-[-150px] top-[20%] h-[450px] w-[450px] rounded-full bg-[var(--gold)]/10 blur-3xl" />

      {/* Technical Grid */}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main */}

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-20 pt-32 md:px-10">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Content */}

          <div>
            {/* Badge */}

            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--gold)]" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--navy)] dark:text-[var(--fg)]">
                Faculty of Engineering · Mansoura University
              </span>
            </div>

            {/* Heading */}

            <h1 className="max-w-4xl text-5xl font-black leading-[1.03] tracking-tight text-[var(--fg)] sm:text-6xl lg:text-[72px]">
              Engineering
              <span className="block bg-gradient-to-r from-[var(--navy)] via-[var(--navy-light)] to-[var(--gold)] bg-clip-text text-transparent">
                Intelligence.
              </span>
              <span className="block">Shaping Tomorrow.</span>
            </h1>

            {/* Description */}

            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--fg-muted)]">
              The Artificial Intelligence Engineering Department at Mansoura
              University prepares the next generation of engineers to
              design intelligent systems, develop innovative technologies,
              and solve complex real-world challenges.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--fg-subtle)]">
              Through advanced education, applied research, practical
              engineering, and interdisciplinary collaboration, we empower
              students to transform knowledge into meaningful technological
              impact.
            </p>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[var(--shadow-color)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--navy-light)]"
              >
                Explore Projects
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-7 py-3.5 font-semibold text-[var(--navy)] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)] hover:text-[var(--gold)] dark:text-[var(--fg)]"
              >
                Discover Our Department
              </Link>
            </div>

            {/* Highlights */}

            <div className="mt-14 border-t border-[var(--border)] pt-8">
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-bold text-[var(--fg)]">
                    Academic Excellence
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--fg-muted)]">
                    Strong engineering and AI foundations.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-[var(--fg)]">
                    Research & Innovation
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--fg-muted)]">
                    Advancing intelligent technologies.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-[var(--fg)]">
                    Practical Engineering
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--fg-muted)]">
                    Turning ideas into real solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}

          <div className="relative flex items-center justify-center">
            <div className="absolute h-[420px] w-[420px] rounded-full bg-[var(--gold)]/10 blur-3xl" />

            <div className="absolute h-[470px] w-[470px] rounded-full border border-[var(--border)]" />

            <div className="absolute h-[390px] w-[390px] rounded-full border border-[var(--gold)]/20" />

            <div className="absolute h-[320px] w-[320px] rounded-full border border-[var(--border)]" />

            <div className="relative flex h-[310px] w-[310px] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-[var(--shadow-color)]">
              <div className="absolute inset-5 rounded-full border border-[var(--gold)]/20" />

              <Image
                src="/logo/logo2.png"
                alt="Artificial Intelligence Engineering Department"
                width={220}
                height={220}
                priority
                className="relative h-52 w-52 object-contain"
              />
            </div>

            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-center shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--gold)]">
                Artificial Intelligence
              </p>

              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Engineering Department
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll */}

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--fg-muted)]">
          Explore
        </span>

        <div className="h-10 w-px bg-gradient-to-b from-[var(--gold)] to-transparent" />
      </div>
    </section>
  );
}
