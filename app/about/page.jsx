import SectionTitle from "../components/SectionTitle";

const staff = [
  {
    name: "Dr. Abeer Twakol",
    role: "Head of Artificial Intelligence Engineering Department",
    image: "/Team/DrAbeer2.png",
  },
  {
    name: "Dr. Ahmed Hussien",
    role: "Vice Head of Artificial Intelligence Engineering Department",
    image: "/Team/DrAhmad2.png",
  },
];

export default function AboutPage() {
  return (
    <section className="min-h-screen bg-[var(--bg)] px-6 pb-40 pt-40 transition-colors duration-300 md:px-10 md:pt-52">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <SectionTitle
          eyebrow="About Us"
          title="Building the future through intelligent engineering."
          description="Discover the academic vision, mission, and leadership driving the Artificial Intelligence Engineering Department at Mansoura University."
        />

        {/* Vision & Mission */}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vision */}

          <div className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-lg md:p-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--gold)]" />

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--gold)]">
                Our Vision
              </p>
            </div>

            <h2 className="text-3xl font-black leading-tight text-[var(--fg)] md:text-4xl">
              Advancing Intelligent Engineering for a Better Future.
            </h2>

            <p className="mt-6 text-base leading-8 text-[var(--fg-muted)]">
              Our vision is to establish a leading academic environment in
              Artificial Intelligence Engineering that integrates
              engineering principles, intelligent technologies, research,
              and innovation. We aspire to prepare graduates capable of
              designing responsible, reliable, and impactful intelligent
              systems that address emerging challenges and contribute to the
              advancement of society.
            </p>
          </div>

          {/* Mission */}

          <div className="group rounded-3xl border border-[var(--gold)]/30 bg-[var(--navy)] p-8 shadow-xl shadow-[var(--shadow-color)] transition duration-300 hover:-translate-y-1 md:p-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--gold-light)]" />

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--gold-light)]">
                Our Mission
              </p>
            </div>

            <h2 className="text-3xl font-black leading-tight text-white md:text-4xl">
              Educate. Innovate. Engineer.
            </h2>

            <p className="mt-6 text-base leading-8 text-[var(--fg-on-dark-surface)] opacity-80">
              Our mission is to provide a rigorous and industry-oriented
              education that equips students with strong foundations in
              engineering, artificial intelligence, and emerging
              technologies. We foster critical thinking, research,
              creativity, collaboration, and hands-on learning while
              preparing our students to transform knowledge into innovative
              solutions for real-world challenges.
            </p>
          </div>
        </div>

        {/* Leadership */}

        <div className="mt-32">
          <SectionTitle
            eyebrow="Department Leadership"
            title="Academic Leadership."
            description="Meet the academic leadership guiding the department's educational, research, and development activities."
          />

          <div className="flex flex-wrap justify-center gap-8">
            {staff.map((member, index) => (
              <div
                key={member.name}
                className="group w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[var(--gold)]/50 hover:shadow-xl"
              >
                {/* Image */}

                <div className="relative h-[380px] overflow-hidden rounded-2xl bg-[var(--bg-soft)]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Number */}

                  <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--navy)] text-xs font-black text-white shadow-lg">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* Info */}

                <div className="px-1 pb-2 pt-6 text-center">
                  <h3 className="text-xl font-bold text-[var(--fg)]">
                    {member.name}
                  </h3>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[var(--fg-muted)]">
                    {member.role}
                  </p>

                  <div className="mx-auto mt-5 h-1 w-10 rounded-full bg-[var(--gold)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
