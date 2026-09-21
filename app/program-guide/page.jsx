"use client";

import { useMemo, useState } from "react";
import { NAME_MAP, SCHEDULED_COURSES, ELECTIVE_POOLS } from "../lib/courses";

/* ============================================================
   Constants & small helpers
============================================================ */
const LEVEL_SEM_MAP = {
  all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "0": [1, 2],
  "1": [3, 4],
  "2": [5, 6],
  "3": [7, 8],
  "4": [9, 10],
};

const CATEGORY_META = {
  UNR: { label: "University Req.", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  BAS: { label: "Basic Sciences", cls: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  ENG: { label: "Engineering", cls: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  CSE: { label: "Computer Science", cls: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  ECE: { label: "Electronics & Comm.", cls: "bg-pink-500/10 text-pink-700 dark:text-pink-400" },
  ELE: { label: "Electrical Eng.", cls: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" },
  PDE: { label: "Production Eng.", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  ARI: { label: "AI Projects", cls: "bg-[var(--gold-soft)] text-[var(--gold)]" },
};

const HEADER_STATS = [
  { value: "160", label: "Total Credits" },
  { value: "45", label: "Scheduled Courses" },
  { value: "13 cr", label: "University Req." },
  { value: "45 cr", label: "College Req." },
  { value: "102 cr", label: "Specialization" },
  { value: "10", label: "Semesters" },
];

function semLevel(sem) {
  return Math.ceil(sem / 2) - 1;
}
function termOf(sem) {
  return sem % 2 === 1 ? "fall" : "spring";
}

/* ============================================================
   Small presentational pieces
============================================================ */
function CategoryTag({ cat }) {
  const meta = CATEGORY_META[cat] || { cls: "bg-gray-500/10 text-gray-600" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.cls}`}>{cat}</span>
  );
}

function TypeBadge({ course }) {
  if (course.type === "Mandatory")
    return (
      <span className="rounded px-2 py-0.5 text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400">
        Mandatory
      </span>
    );
  if (course.type === "Project")
    return (
      <span className="rounded px-2 py-0.5 text-[11px] font-bold bg-[var(--gold-soft)] text-[var(--gold)]">
        Project / Training
      </span>
    );
  const groupCls =
    course.eGroup === "L400"
      ? "bg-red-500/10 text-red-700 dark:text-red-400"
      : "bg-violet-500/10 text-violet-700 dark:text-violet-400";
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${groupCls}`}>
        {course.eGroup}
      </span>
      {course.eSlots.map((s) => (
        <span
          key={s}
          className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${
            ["E1", "E3", "E4"].includes(s)
              ? "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400"
              : "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
          }`}
        >
          {s}
        </span>
      ))}
    </span>
  );
}

function SemBadge({ sem }) {
  const fall = sem % 2 === 1;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${
        fall
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
      }`}
    >
      {fall ? "🍂" : "🌸"} Sem {sem} <span className="opacity-70">(Lv {semLevel(sem)})</span>
    </span>
  );
}

function PrereqList({ pre }) {
  if (!pre.length) return <span className="text-xs italic text-[var(--fg-subtle)]">None</span>;
  return (
    <div className="flex flex-col gap-1">
      {pre.map((p, i) =>
        p.startsWith("≥") ? (
          <span
            key={i}
            className="w-fit rounded-full border border-[var(--gold)]/30 bg-[var(--gold-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--gold)]"
          >
            {p}
          </span>
        ) : (
          <code key={i} className="text-xs text-[var(--fg-muted)]">
            {p}
            {NAME_MAP[p] ? ` – ${NAME_MAP[p]}` : ""}
          </code>
        )
      )}
    </div>
  );
}

function ElectivePool({ group }) {
  const items = ELECTIVE_POOLS[group] || [];
  const isL400 = group === "L400";
  return (
    <div
      className={`rounded-xl border p-4 ${
        isL400 ? "border-red-500/20 bg-red-500/[0.03]" : "border-violet-500/20 bg-violet-500/[0.03]"
      }`}
    >
      <p
        className={`mb-3 text-xs font-bold ${
          isL400 ? "text-red-700 dark:text-red-400" : "text-violet-700 dark:text-violet-400"
        }`}
      >
        📋{" "}
        {isL400
          ? "L400 Pool — Choose 3 courses (Electives 3, 4 & 5)"
          : "L300 Pool — Choose 2 courses (Electives 1 & 2)"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.code}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <code className="text-xs font-bold text-[var(--navy)] dark:text-[var(--gold)]">
                {it.code}
              </code>
              <CategoryTag cat={it.cat} />
              <span className="text-[11px] text-[var(--fg-subtle)]">{it.cr} cr</span>
            </div>
            <p className="mb-1 text-sm font-bold text-[var(--fg)]">{it.name}</p>
            <p className="mb-1 text-xs text-[var(--fg-muted)]">
              <strong className="text-[var(--fg)]">Prerequisites:</strong>{" "}
              {it.pre.length === 0
                ? "None"
                : it.pre.map((p) => (NAME_MAP[p] ? `${p} – ${NAME_MAP[p]}` : p)).join(" · ")}
            </p>
            <p className="text-xs italic text-[var(--fg-subtle)]">{it.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Courses tab
============================================================ */
function CoursesTab() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [semester, setSemester] = useState("all");
  const [term, setTerm] = useState("all");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  const semesterOptions = LEVEL_SEM_MAP[level];

  function toggleExpand(code) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function resetFilters() {
    setSearch("");
    setLevel("all");
    setSemester("all");
    setTerm("all");
    setCategory("");
    setType("");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SCHEDULED_COURSES.filter((c) => {
      const lv = semLevel(c.sem);
      const rowTerm = termOf(c.sem);
      if (level !== "all" && String(lv) !== level) return false;
      if (semester !== "all" && String(c.sem) !== semester) return false;
      if (term !== "all" && rowTerm !== term) return false;
      if (category && c.cat !== category) return false;
      if (type && c.type !== type) return false;
      if (q && !(c.code + " " + c.name).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, level, semester, term, category, type]);

  const totalCredits = filtered.reduce((sum, c) => sum + c.cr, 0);

  return (
    <div>
      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {HEADER_STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center"
          >
            <p className="text-xl font-black text-[var(--navy)] dark:text-[var(--gold)]">{s.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-[var(--fg-muted)]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="min-w-[190px] flex-1">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--navy)] dark:text-[var(--gold)]">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Code or course name…"
            dir="ltr"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--gold)]"
          />
        </div>

        <FilterSelect
          label="Level"
          value={level}
          onChange={(v) => {
            setLevel(v);
            setSemester("all");
          }}
          options={[
            ["all", "All Levels"],
            ["0", "Level 0"],
            ["1", "Level 1"],
            ["2", "Level 2"],
            ["3", "Level 3"],
            ["4", "Level 4"],
          ]}
        />

        <FilterSelect
          label="Semester"
          value={semester}
          onChange={setSemester}
          options={[
            ["all", "All Semesters"],
            ...semesterOptions.map((s) => [
              String(s),
              `Sem ${s} – ${s % 2 === 1 ? "🍂 Fall" : "🌸 Spring"} (Lv ${semLevel(s)})`,
            ]),
          ]}
        />

        <FilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            ["", "All Categories"],
            ["UNR", "UNR – University Req."],
            ["BAS", "BAS – Basic Sciences"],
            ["ENG", "ENG – Engineering"],
            ["CSE", "CSE – Computer Science"],
            ["ECE", "ECE – Electronics & Comm."],
            ["ELE", "ELE – Electrical Eng."],
            ["PDE", "PDE – Production Eng."],
            ["ARI", "ARI – AI Projects"],
          ]}
        />

        <FilterSelect
          label="Term"
          value={term}
          onChange={(v) => {
            setTerm(v);
            setSemester("all");
          }}
          options={[
            ["all", "All Terms"],
            ["fall", "🍂 Fall (Odd semesters)"],
            ["spring", "🌸 Spring (Even semesters)"],
          ]}
        />

        <FilterSelect
          label="Type"
          value={type}
          onChange={setType}
          options={[
            ["", "All Types"],
            ["Mandatory", "Mandatory"],
            ["Elective", "Elective"],
            ["Project", "Project / Training"],
          ]}
        />

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-bold text-[var(--fg-muted)] transition hover:bg-red-500/10 hover:text-red-600"
        >
          ↺ Reset
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-[var(--surface-soft)] px-4 py-2.5 text-xs text-[var(--fg-muted)]">
        <strong className="text-[var(--fg)]">Elective Slots:</strong>
        <span className="flex items-center gap-1">
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-400">
            E1
          </span>
          Elective (1) · L300 · Sem 7
        </span>
        <span className="flex items-center gap-1">
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
            E2
          </span>
          Elective (2) · L300 · Sem 8
        </span>
        <span className="flex items-center gap-1">
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-400">
            E3/E4
          </span>
          Electives (3,4) · L400 · Sem 9
        </span>
        <span className="flex items-center gap-1">
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
            E5
          </span>
          Elective (5) · L400 · Sem 10
        </span>
        <span className="italic text-[var(--fg-subtle)]">— Click any elective row ▶ to see available courses</span>
      </div>

      <p className="mb-3 text-sm font-bold text-[var(--gold)]">
        Showing {filtered.length} course{filtered.length !== 1 ? "s" : ""} · {totalCredits} credit hours
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="bg-[var(--navy)] text-white">
              <th className="px-3 py-2.5 text-left text-xs font-bold">#</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold">Code</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold">Course Name</th>
              <th className="px-3 py-2.5 text-center text-xs font-bold">Cr</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold">Cat.</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold">Type / Slot</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold">Semester</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold">Prerequisites</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const isElective = c.type === "Elective";
              const isOpen = expanded.has(c.code);
              return (
                <>
                  <tr
                    key={c.code}
                    className={`border-b border-[var(--border)] transition hover:bg-[var(--surface-soft)] ${
                      c.sem % 2 === 1 ? "border-l-4 border-l-amber-400/60" : "border-l-4 border-l-green-400/60"
                    }`}
                  >
                    <td className="px-3 py-2.5 text-[var(--fg-subtle)]">{i + 1}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs font-bold text-[var(--navy)] dark:text-[var(--gold)]">
                      {c.code}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--fg)]">
                      {isElective ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleExpand(c.code)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                              c.eGroup === "L400"
                                ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                                : "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400"
                            }`}
                          >
                            <span
                              className="inline-block transition-transform"
                              style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
                            >
                              ▶
                            </span>
                            View {c.eGroup} courses
                          </button>
                        </div>
                      ) : (
                        c.name
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-[var(--gold)]">{c.cr}</td>
                    <td className="px-3 py-2.5">
                      <CategoryTag cat={c.cat} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <TypeBadge course={c} />
                    </td>
                    <td className="px-3 py-2.5">
                      <SemBadge sem={c.sem} />
                    </td>
                    <td className="px-3 py-2.5">
                      <PrereqList pre={c.pre} />
                    </td>
                  </tr>
                  {isElective && isOpen && (
                    <tr key={`${c.code}-pool`} className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
                      <td colSpan={8} className="p-4">
                        <ElectivePool group={c.eGroup} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const current = options.find(([v]) => v === value);

  return (
    <div className="relative min-w-[160px]">
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--navy)] dark:text-[var(--gold)]">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--gold)]"
      >
        <span className="truncate">{current ? current[1] : ""}</span>
        <span
          className={`shrink-0 text-[10px] text-[var(--fg-subtle)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Invisible backdrop — closes the list on outside click */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute z-20 mt-1 max-h-64 w-full min-w-[230px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
            {options.map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  onChange(v);
                  setOpen(false);
                }}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  v === value
                    ? "bg-[var(--gold-soft)] font-bold text-[var(--gold)]"
                    : "text-[var(--fg)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   Specs tab
============================================================ */
function SpecsSection({ icon, title, children }) {
  return (
    <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-7">
      <h2 className="mb-4 flex items-center gap-2 border-b-2 border-[var(--gold)]/30 pb-3 text-lg font-black text-[var(--navy)] dark:text-[var(--gold)]">
        <span>{icon}</span> {title}
      </h2>
      <div className="space-y-3 text-sm leading-7 text-[var(--fg-muted)]">{children}</div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--navy)] dark:text-[var(--gold)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[var(--fg)]">{value}</p>
    </div>
  );
}

function RuleBox({ tone = "default", children }) {
  const toneCls = {
    default: "border-l-[var(--navy)]",
    warn: "border-l-orange-500 bg-orange-500/5",
    green: "border-l-emerald-500 bg-emerald-500/5",
  }[tone];
  return (
    <div className={`rounded-r-lg border border-[var(--border)] border-l-4 bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--fg-muted)] ${toneCls}`}>
      {children}
    </div>
  );
}

const GRADE_ROWS = [
  ["A+", "4.00", "97% – 100%", "emerald"],
  ["A", "4.00", "93% – <97%", "emerald"],
  ["A−", "3.70", "89% – <93%", "emerald"],
  ["B+", "3.30", "84% – <89%", "blue"],
  ["B", "3.00", "80% – <84%", "blue"],
  ["B−", "2.70", "76% – <80%", "blue"],
  ["C+", "2.30", "73% – <76%", "purple"],
  ["C", "2.00", "70% – <73%", "purple"],
  ["C−", "1.70", "67% – <70%", "purple"],
  ["D+", "1.30", "64% – <67%", "orange"],
  ["D", "1.00", "60% – <64%", "orange"],
  ["F", "0.00", "Below 60%", "red"],
];
const GRADE_COLOR = {
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  red: "bg-red-500/10 text-red-700 dark:text-red-400",
};

function SpecsTab() {
  return (
    <div className="mx-auto max-w-4xl">
      <SpecsSection icon="🎓" title="Program Overview">
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoCard label="Degree" value="B.Sc. in AI Engineering" />
          <InfoCard label="System" value="Credit Hours (American)" />
          <InfoCard label="Total Credits" value="160 Credit Hours" />
          <InfoCard label="Total Courses" value="56 Courses" />
          <InfoCard label="Duration" value="5 Levels / 10 Semesters" />
          <InfoCard label="Institution" value="Faculty of Engineering – Mansoura University" />
        </div>
        <p><strong className="text-[var(--fg)]">Vision:</strong> To achieve creativity and leadership locally and regionally in AI Engineering and its applications.</p>
        <p><strong className="text-[var(--fg)]">Mission:</strong> Prepare distinguished engineers in AI Engineering, forming scientifically and professionally qualified engineering cadres capable of competing in major technology-driven institutions, serving the community and developing the environment.</p>
      </SpecsSection>

      <SpecsSection icon="📥" title="Admission & Enrollment Requirements">
        <ul className="list-disc space-y-1.5 pr-5">
          <li>The student must meet the admission conditions set by the Supreme Council of Universities.</li>
          <li>The student must hold a General Secondary Certificate (or its equivalent) with a mathematics stream.</li>
          <li>The student must meet the internal admission criteria approved by the Faculty Council.</li>
        </ul>
        <h3 className="pt-2 font-bold text-[var(--fg)]">Transfer Students</h3>
        <ul className="list-disc space-y-1.5 pr-5">
          <li>Transfer students must have completed Level 000 courses with an average of at least 2.00 (max 4.00) and meet Faculty Council criteria.</li>
          <li>Students from other faculties within the same university may be accepted based on Faculty Council criteria.</li>
          <li>Students who studied outside Mansoura University for more than two years must provide a transcript of grades and completed credit hours.</li>
        </ul>
      </SpecsSection>

      <SpecsSection icon="📐" title="Academic Regulations">
        <h3 className="font-bold text-[var(--fg)]">Attendance</h3>
        <RuleBox tone="warn">
          <strong className="text-[var(--fg)]">Maximum allowed absence: 25%</strong> of total lecture and lab hours per course.<br />
          • First warning: after 10% absence.<br />
          • Second warning: after 20% absence.<br />
          • Exceeding 25% without approved excuse → grade of <strong className="text-[var(--fg)]">&quot;Deprived&quot;</strong> — counts in GPA.
        </RuleBox>
        <h3 className="pt-2 font-bold text-[var(--fg)]">Enrollment Suspension (وقف القيد)</h3>
        <RuleBox>A student may suspend enrollment by paying the relevant administrative fees to one of the new programs.</RuleBox>
        <h3 className="pt-2 font-bold text-[var(--fg)]">Partial Withdrawal</h3>
        <RuleBox>
          Students absent for more than a week must notify the academic advisor. Medical absence requires an official certificate from a recognized hospital or health center. If the student misses the final exam, they must submit a medical certificate for the &quot;Incomplete (I)&quot; grade.
        </RuleBox>
        <h3 className="pt-2 font-bold text-[var(--fg)]">Late Payment Fine (غرامة التأخير)</h3>
        <RuleBox tone="warn">If fees are paid late, fines are applied as per Faculty and University decisions.</RuleBox>
      </SpecsSection>

      <SpecsSection icon="📚" title="Academic Load per Semester">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--surface-soft)] text-[var(--navy)] dark:text-[var(--gold)]">
                <th className="border border-[var(--border)] px-3 py-2 text-center font-bold">#</th>
                <th className="border border-[var(--border)] px-3 py-2 text-center font-bold">Cumulative GPA</th>
                <th className="border border-[var(--border)] px-3 py-2 text-center font-bold">Max Credit Hours Allowed</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-[var(--border)] px-3 py-2 text-center">1</td><td className="border border-[var(--border)] px-3 py-2 text-center">GPA &lt; 2.00</td><td className="border border-[var(--border)] px-3 py-2 text-center">Up to 14 credit hours</td></tr>
              <tr><td className="border border-[var(--border)] px-3 py-2 text-center">2</td><td className="border border-[var(--border)] px-3 py-2 text-center">2.00 ≤ GPA &lt; 3.00</td><td className="border border-[var(--border)] px-3 py-2 text-center">Up to 18 credit hours</td></tr>
              <tr><td className="border border-[var(--border)] px-3 py-2 text-center">3</td><td className="border border-[var(--border)] px-3 py-2 text-center">GPA ≥ 3.00</td><td className="border border-[var(--border)] px-3 py-2 text-center">Up to 21 credit hours</td></tr>
            </tbody>
          </table>
        </div>
        <RuleBox tone="green">
          Minimum allowed load: <strong className="text-[var(--fg)]">12 credit hours</strong> per semester (Fall/Spring), except for graduation, observation hold, or Academic Council approval.<br />
          Summer semester: max 3 courses. Graduation projects may <strong className="text-[var(--fg)]">not</strong> be registered in summer.
        </RuleBox>
      </SpecsSection>

      <SpecsSection icon="➕➖" title="Add, Drop & Withdrawal">
        <ul className="list-disc space-y-1.5 pr-5">
          <li>Students may add or drop courses after registration via procedures approved by the Academic Council.</li>
          <li>A course may be dropped (with academic advisor approval) up to the end of the <strong className="text-[var(--fg)]">4th week</strong> — without affecting the academic load minimum.</li>
          <li>A course may be withdrawn (grade <strong className="text-[var(--fg)]">W</strong>) up to the end of the <strong className="text-[var(--fg)]">10th week</strong> of Fall/Spring (3rd week in summer), provided the student has not exceeded the permitted absence rate.</li>
          <li><strong className="text-[var(--fg)]">Re-registration:</strong> A student who previously received <strong className="text-[var(--fg)]">F</strong> in a course may re-register; the maximum achievable grade is <strong className="text-[var(--fg)]">B+</strong>.</li>
          <li><strong className="text-[var(--fg)]">Elective re-registration:</strong> If an elective is failed and re-taken, the student gets the lower of the two grades as a cap. If the elective is changed, the student keeps the grade earned.</li>
        </ul>
      </SpecsSection>

      <SpecsSection icon="📊" title="Assessment & Grading System">
        <h3 className="font-bold text-[var(--fg)]">Grade Distribution — Theory-Only Courses</h3>
        <div className="grid max-w-md grid-cols-3 gap-2">
          <InfoCard label="Midterm Exam" value="20%" />
          <InfoCard label="Semester Works" value="30%" />
          <InfoCard label="Final Exam" value="50%" />
        </div>
        <h3 className="pt-2 font-bold text-[var(--fg)]">Grade Distribution — Theory + Lab Courses</h3>
        <div className="grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoCard label="Midterm" value="20%" />
          <InfoCard label="Semester Works" value="20%" />
          <InfoCard label="Lab Exam" value="10%" />
          <InfoCard label="Final Exam" value="50%" />
        </div>
        <h3 className="pt-2 font-bold text-[var(--fg)]">Grade Distribution — Projects</h3>
        <div className="grid max-w-xs grid-cols-2 gap-2">
          <InfoCard label="Periodic Follow-up" value="50%" />
          <InfoCard label="Final Discussion" value="50%" />
        </div>

        <RuleBox tone="warn">
          <strong className="text-[var(--fg)]">Passing condition:</strong> A student must score at least <strong className="text-[var(--fg)]">60%</strong> in any course, and at least <strong className="text-[var(--fg)]">40%</strong> in the final written exam.
        </RuleBox>

        <h3 className="pt-2 font-bold text-[var(--fg)]">Grading Scale</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--surface-soft)] text-[var(--navy)] dark:text-[var(--gold)]">
                <th className="border border-[var(--border)] px-3 py-2 text-left font-bold">Grade</th>
                <th className="border border-[var(--border)] px-3 py-2 text-left font-bold">Points</th>
                <th className="border border-[var(--border)] px-3 py-2 text-left font-bold">Percentage Range</th>
              </tr>
            </thead>
            <tbody>
              {GRADE_ROWS.map(([g, pts, range, color]) => (
                <tr key={g}>
                  <td className="border border-[var(--border)] px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${GRADE_COLOR[color]}`}>{g}</span>
                  </td>
                  <td className="border border-[var(--border)] px-3 py-2">{pts}</td>
                  <td className="border border-[var(--border)] px-3 py-2">{range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="pt-2 font-bold text-[var(--fg)]">Special Grade Codes</h3>
        <div className="overflow-x-auto">
          <table className="w-full max-w-sm border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--surface-soft)] text-[var(--navy)] dark:text-[var(--gold)]">
                <th className="border border-[var(--border)] px-3 py-2 text-left font-bold">Code</th>
                <th className="border border-[var(--border)] px-3 py-2 text-left font-bold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["W", "Official Withdrawal"],
                ["AU", "Auditing (no credit)"],
                ["I", "Incomplete"],
                ["F", "Fail"],
                ["P", "Pass"],
              ].map(([code, meaning]) => (
                <tr key={code}>
                  <td className="border border-[var(--border)] px-3 py-2 font-bold text-[var(--fg)]">{code}</td>
                  <td className="border border-[var(--border)] px-3 py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpecsSection>

      <SpecsSection icon="🔢" title="GPA Calculation">
        <RuleBox tone="green">
          <strong className="text-[var(--fg)]">Semester GPA</strong> = Σ (Grade Points × Credit Hours) ÷ Σ Credit Hours<br /><br />
          <strong className="text-[var(--fg)]">Cumulative GPA</strong> = Σ (Grade Points × Credit Hours for all courses) ÷ Total Graded Hours<br /><br />
          <strong className="text-[var(--fg)]">Cumulative Mark %</strong> = [Σ (Mark × Credit Hours) ÷ Σ Credit Hours] × 100
        </RuleBox>
      </SpecsSection>

      <SpecsSection icon="⚠️" title="Academic Warning & Dismissal">
        <ul className="list-disc space-y-1.5 pr-5">
          <li>A student is placed on <strong className="text-[var(--fg)]">academic warning</strong> if their cumulative GPA falls below <strong className="text-[var(--fg)]">2.00</strong> at the end of the 2nd semester or any subsequent semester.</li>
          <li>A warned student is placed under academic probation and may not register more than <strong className="text-[var(--fg)]">12 credit hours</strong>; probation is lifted when GPA reaches 2.00+.</li>
          <li>A warned student who repeatedly fails to raise GPA above 2.00 for <strong className="text-[var(--fg)]">three consecutive main semesters</strong> is <strong className="text-[var(--fg)]">dismissed</strong>.</li>
          <li>Maximum study period: <strong className="text-[var(--fg)]">10 years</strong>. A student who does not meet graduation requirements within this period is dismissed.</li>
          <li>The Faculty Council may grant one final chance (at most) over two consecutive semesters to raise GPA to 2.00, provided the student has passed at least 80% of required credit hours.</li>
        </ul>
      </SpecsSection>

      <SpecsSection icon="🎓" title="Graduation Requirements">
        <RuleBox tone="green">To receive the B.Sc. degree in AI Engineering, a student must:</RuleBox>
        <ul className="list-disc space-y-1.5 pr-5">
          <li>Complete at least <strong className="text-[var(--fg)]">160 credit hours</strong> from the program (and 163 cr. from Construction & Advanced Technology Engineering program; 162 cr. from Advanced Technology program) — with no grade below <strong className="text-[var(--fg)]">D</strong>.</li>
          <li>Achieve a cumulative GPA of at least <strong className="text-[var(--fg)]">C (2.00 / 4.00)</strong>.</li>
          <li>Fulfill all program-specific requirements.</li>
          <li>Pass all required graduation projects.</li>
        </ul>
        <RuleBox tone="warn">After meeting all requirements, the student graduates and may not register any further courses under the above conditions.</RuleBox>
      </SpecsSection>

      <SpecsSection icon="📈" title="Grade Improvement System">
        <ul className="list-disc space-y-1.5 pr-5">
          <li>A student may improve up to <strong className="text-[var(--fg)]">5 courses</strong> to raise the cumulative GPA during the study period.</li>
          <li>Improvement is allowed only if the student has not withdrawn from the course at the end of the official withdrawal period; withdrawal after the 4th week of a main semester is not allowed for improvement.</li>
          <li>A student who has finished the program with GPA below 2.00 may improve any previously studied courses until reaching the minimum GPA.</li>
          <li>A student may not improve a course they have already paid for re-registration.</li>
        </ul>
      </SpecsSection>

      <SpecsSection icon="🏗️" title="Training & Projects">
        <h3 className="font-bold text-[var(--fg)]">Practical Training (ARI 171)</h3>
        <RuleBox tone="green">Conducted at the university laboratories or specialized units for at least <strong className="text-[var(--fg)]">2 weeks / 60 hours total</strong>. Student submits a report and is assessed.</RuleBox>
        <h3 className="pt-2 font-bold text-[var(--fg)]">Field Training — Levels 300 & 400 (ARI 271 & ARI 371)</h3>
        <RuleBox tone="green">Conducted externally at a relevant organization for at least <strong className="text-[var(--fg)]">4 weeks / 120 hours total</strong>. Student must obtain an official certificate confirming completion and required experience.</RuleBox>
        <RuleBox>
          <strong className="text-[var(--fg)]">Important rules:</strong>
          <ul className="mt-2 list-disc space-y-1.5 pr-5">
            <li>In all training cases, the student receives a Pass/Fail grade — does not add to GPA.</li>
            <li>The student may not graduate unless they pass both practical and field training.</li>
            <li>Students who reach Level 400 without completing training may repeat it as many times as needed to pass.</li>
            <li>Training abroad is allowed with Academic Council approval.</li>
          </ul>
        </RuleBox>
        <h3 className="pt-2 font-bold text-[var(--fg)]">Graduation Projects (ARI 381, 481, 482)</h3>
        <ul className="list-disc space-y-1.5 pr-5">
          <li>Students form groups of 2–3 to complete project topics set by the Academic Council for the last two academic years, under faculty supervision.</li>
          <li>The final project (Project 3) integrates all disciplines studied throughout the program.</li>
          <li>An additional completion period of one month may be granted after the last semester&apos;s exams.</li>
          <li>The student cannot graduate without passing all required projects.</li>
        </ul>
      </SpecsSection>

      <SpecsSection icon="📝" title="Incomplete Courses (I Grade)">
        <RuleBox>
          If a student presents a valid excuse for missing the final exam within 2 days of the exam, the course is recorded as <strong className="text-[var(--fg)]">Incomplete (I)</strong>, provided the student:<br />
          • Has scored at least <strong className="text-[var(--fg)]">60%</strong> of semester work grades.<br />
          • Has not been previously barred from the final exam.<br /><br />
          The student sits for the exam in the following semester (usually the 1st week), and the semester work grade is carried forward and added to the new final exam grade.
        </RuleBox>
      </SpecsSection>
    </div>
  );
}

/* ============================================================
   Page
============================================================ */
export default function ProgramGuidePage() {
  const [tab, setTab] = useState("courses");

  return (
    <section className="min-h-screen bg-[var(--bg)] px-6 pb-32 pt-40 transition-colors duration-300 md:px-10 md:pt-52">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/25 bg-[var(--gold-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--gold)]">
            Program Guide
          </span>
          <h1 className="text-4xl font-black text-[var(--fg)] md:text-5xl">
            Courses &amp; Program Regulations
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--fg-muted)]">
            Bachelor of Artificial Intelligence Engineering — Faculty of Engineering, Mansoura
            University. استكشف كل مواد البرنامج، المتطلبات السابقة، المواد الاختيارية، ولوائح
            الدراسة كاملة.
          </p>
        </div>

        <div className="mb-8 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setTab("courses")}
            className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
              tab === "courses"
                ? "bg-[var(--navy)] text-white shadow-md"
                : "bg-[var(--surface-soft)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            📋 Courses &amp; Prerequisites
          </button>
          <button
            type="button"
            onClick={() => setTab("specs")}
            className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
              tab === "specs"
                ? "bg-[var(--navy)] text-white shadow-md"
                : "bg-[var(--surface-soft)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            📖 Program Regulations &amp; Specs
          </button>
        </div>

        {tab === "courses" ? <CoursesTab /> : <SpecsTab />}
      </div>
    </section>
  );
}
