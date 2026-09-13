"use client";

import { useRef, useState } from "react";

/* ============================================================
   Defaults pulled from the official Graduation Project Template
============================================================ */
const YN_QUESTIONS = [
  "هل تم تنفيذ المشروع من قبل",
  "هل المشروع يقدم مساعدة لحل أحد المشاكل الوطنية",
  "هل هناك خطة للاشتراك في المسابقات المحلية والدولية",
  "هل هناك خطة لتحويل المشروع إلى شركة Start up",
  "هل هناك تعاون علمي أو أنشطة سابقة مشتركة بين أفراد الفريق",
];

// Placeholder hints only (guidance text) — the fields themselves start
// completely empty; the student fills in every value from scratch.
const SCHEDULE_HINTS = [
  "e.g. Project Planning & Requirement Analysis",
  "e.g. UI/UX Design & Database Preparation",
  "e.g. Backend Development",
  "e.g. AI & NLP Integration",
  "e.g. Speech-to-Text & Voice Interface",
  "e.g. Data Visualization & Dashboard",
  "e.g. System Integration & Testing",
  "e.g. Deployment & Documentation",
];

const SW_CATS = [
  {
    key: "frontend",
    label: "Frontend",
    hint: "e.g. HTML, CSS, JavaScript\nReact.js / Vue.js\nChart.js / D3.js (for data visualization)",
  },
  {
    key: "backend",
    label: "Backend",
    hint: "e.g. Python (Flask or Django) / Node.js\nRESTful APIs for communication between frontend and backend",
  },
  {
    key: "ai",
    label: "Artificial Intelligence & NLP",
    hint: "e.g. Large Language Models (LLMs)\nNatural Language Processing (NLP) techniques\nPrompt engineering and query validation",
  },
  {
    key: "database",
    label: "Database",
    hint: "e.g. MySQL, PostgreSQL, or SQL Server",
  },
  {
    key: "security",
    label: "Security",
    hint: "e.g. Authentication (JWT / OAuth), access control, data encryption",
  },
  {
    key: "deployment",
    label: "Deployment & Infrastructure",
    hint: "e.g. Cloud platform (AWS / Azure / Google Cloud), Docker, Git & GitHub",
  },
  {
    key: "visualization",
    label: "Visualization & Reporting",
    hint: "e.g. Interactive dashboards, KPIs and analytical reports",
  },
];

const HARDWARE_HINT =
  "e.g. Development Hardware — Personal Computer or Laptop\nMinimum specifications:\nCPU: Intel Core i5 or higher\nRAM: 8 GB minimum\nStorage: 256 GB SSD minimum";

const MAX_TEAM = 11;
const DEFAULT_TEAM_ROWS = 5;

// Registration eligibility rules — minimum completed credit hours required
// to register each project.
const PROJECT_OPTIONS = [
  { id: 1, label: "مشروع 1", hours: 96 },
  { id: 2, label: "مشروع 2", hours: 116 },
  { id: 3, label: "مشروع 3", hours: 130 },
];

/* Note: this page just downloads the filled PDF directly — nothing is
   stored or shown on the site. */

/* ============================================================
   Small helpers
============================================================ */
function esc(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function bulletList(text) {
  return (text || "")
    .split("\n")
    .filter(Boolean)
    .map((l) => `• ${esc(l)}`)
    .join("<br/>");
}

function pdfHead() {
  return `<div class="pg-head">
    <img src="/logo/logo1.png" alt="University Logo" class="pg-logo" />
    <div class="pg-head-text">
      <p class="t1">برنامج هندسة الذكاء الاصطناعى</p>
      <p class="t2">كلية الهندسة ـ جامعة المنصورة</p>
    </div>
    <img src="/logo/logo2.png" alt="Department Logo" class="pg-logo" />
  </div><div class="pg-rule"></div>`;
}

function pdfFoot(n) {
  return `<div class="pg-foot">
    <b>رؤية البرنامج:</b> الوصول الى مرتبة الإبداع والريادة محلياً وإقليمياً في مجال هندسة الذكاء الاصطناعي وتطبيقاته.<br/>
    <b>رسالة البرنامج:</b> "اعداد مهندس متميز في مجال هندسة الذكاء الاصطناعي وتطبيقاته، وتكوين كوادر هندسية مؤهلة علمياً ومهنياً قادرة على المنافسة في كبرى المؤسسات التي يعتمد مجال عملها على التكنولوجيا المتطورة، خدمة للمجتمع وتنمية البيئة."
    <div class="links"><span>Website: facebook.com/groups/aiefemu</span><span>Email: aie@mans.edu.eg</span></div>
    <div class="pagenum">Page ${n} of 5</div>
  </div>`;
}

function renderPdfPages(refs, data) {
  const ynRows = YN_QUESTIONS.map(
    (q, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td class="arb">${esc(q)}</td>
        <td class="center">${data.yn[i] === "yes" ? "✓" : ""}</td>
        <td class="center">${data.yn[i] === "no" ? "✓" : ""}</td>
      </tr>`
  ).join("");

  const supRows = data.supervisors
    .map(
      (n, i) =>
        `<tr><td class="center">${i + 1}</td><td class="arb">${esc(n)}</td><td></td></tr>`
    )
    .join("");

  const teamRows = data.team
    .map(
      (t, i) =>
        `<tr><td class="center">${i + 1}</td><td class="arb">${esc(t.name)}</td><td class="center">${esc(t.hours)}</td><td class="center">${esc(t.gpa)}</td></tr>`
    )
    .join("");

  refs.page1.current.innerHTML = `
    ${pdfHead()}
    <p class="pg-title">Graduation Project Template</p>
    <p style="font-size:12px;font-weight:800;">Course Title: <span style="font-weight:400;">${esc(data.courseTitle)}</span></p>
    <p class="sec-h" style="text-decoration:none;">عنوان المشروع باللغة العربية:</p>
    <p class="arb" style="text-align:center;font-weight:800;font-size:14px;">${esc(data.titleAr)}</p>
    <p class="sec-h" style="text-decoration:none;margin-top:14px;">Project Title:</p>
    <p style="text-align:center;font-weight:800;font-size:14px;">${esc(data.titleEn)}</p>

    <p class="sec-h">فريق الإشراف (في حالة تحديد مشرف للمشروع)</p>
    <table dir="rtl"><thead><tr><th style="width:36px;">م</th><th>الاسم</th><th style="width:110px;">التوقيع</th></tr></thead><tbody>${supRows}</tbody></table>

    <p class="sec-h">معلومات أساسية عن مقترح المشروع المقدم</p>
    <table dir="rtl"><thead><tr><th style="width:36px;">م</th><th>السؤال</th><th style="width:50px;">نعم</th><th style="width:50px;">لا</th></tr></thead><tbody>${ynRows}</tbody></table>

    <p class="sec-h">Project Team</p>
    <table dir="rtl"><thead><tr><th style="width:36px;">م</th><th>الاسم رباعي باللغة العربية</th><th style="width:130px;">الساعات المكتسبة</th><th style="width:70px;">GPA</th></tr></thead><tbody>${teamRows}</tbody></table>
    ${pdfFoot(1)}`;

  refs.page2.current.innerHTML = `
    ${pdfHead()}
    <p class="sec-h">PROJECT ABSTRACT:</p>
    <div class="abs-box">
      <div class="abs-h">Abstract</div>
      <div class="abs-body">${(data.abstract || "")
        .split(/\n{2,}/)
        .map((p) => `<p>${esc(p)}</p>`)
        .join("")}</div>
    </div>
    ${pdfFoot(2)}`;

  const schedRows = data.schedule
    .map(
      (t, i) =>
        `<tr><td class="center" style="font-weight:800;">Week ${i + 1}</td><td>${esc(t)}</td></tr>`
    )
    .join("");
  const swFirst = SW_CATS.slice(0, 4)
    .map(
      (c, i) =>
        `<tr><td class="center" style="width:36px;">${i + 1}</td><td><b>${c.label}:</b><br/>${bulletList(data.sw[c.key])}</td></tr>`
    )
    .join("");

  refs.page3.current.innerHTML = `
    ${pdfHead()}
    <p class="sec-h">TIME SCHEDULE:</p>
    <table><thead><tr><th style="width:90px;">Week</th><th>Task</th></tr></thead><tbody>${schedRows}</tbody></table>
    <p class="sec-h">REQUIRED SOFTWARE TOOLS:</p>
    <table><thead><tr><th style="width:36px;">No.</th><th>Software Tools</th></tr></thead><tbody>${swFirst}</tbody></table>
    ${pdfFoot(3)}`;

  const swRest = SW_CATS.slice(4)
    .map(
      (c, i) =>
        `<tr><td class="center" style="width:36px;">${i + 5}</td><td><b>${c.label}:</b><br/>${bulletList(data.sw[c.key])}</td></tr>`
    )
    .join("");

  refs.page4.current.innerHTML = `
    ${pdfHead()}
    <p class="sec-h">REQUIRED SOFTWARE TOOLS (continued):</p>
    <table><thead><tr><th style="width:36px;">No.</th><th>Software Tools</th></tr></thead><tbody>${swRest}</tbody></table>
    <p class="sec-h">REQUIRED HARDWARE TOOLS:</p>
    <table><thead><tr><th style="width:36px;">No.</th><th>Hardware Tools</th></tr></thead>
      <tbody>
        <tr><td class="center">1</td><td>${bulletList(data.hardware)}</td></tr>
        <tr><td class="center">2</td><td>--------------</td></tr>
      </tbody>
    </table>
    ${pdfFoot(4)}`;

  let total = 0,
    hasNumeric = false;
  const budgetRows = data.budget
    .map((b, i) => {
      const num = parseFloat((b.price || "").replace(/[^\d.]/g, ""));
      if (!isNaN(num) && b.price) {
        total += num;
        hasNumeric = true;
      }
      return `<tr><td class="center">${i + 1}</td><td>${esc(b.item)}</td><td class="center">${esc(b.price)}</td></tr>`;
    })
    .join("");
  const sponsorRows = data.sponsors
    .map((s, i) => `<tr><td class="center">${i + 1}</td><td>${esc(s)}</td></tr>`)
    .join("");

  refs.page5.current.innerHTML = `
    ${pdfHead()}
    <p class="sec-h">BUDGET ANALYSIS:</p>
    <table><thead><tr><th style="width:36px;">No.</th><th>Item</th><th style="width:130px;">Price</th></tr></thead>
      <tbody>${budgetRows}<tr><td colspan="2" class="center" style="font-weight:800;">Total</td><td class="center" style="font-weight:800;">${hasNumeric ? total.toFixed(2) + " $" : ""}</td></tr></tbody>
    </table>

    <p class="sec-h">SPONSORS:</p>
    <table><thead><tr><th style="width:36px;">No.</th><th>Sponsor</th></tr></thead><tbody>${sponsorRows}</tbody></table>

    <p class="sec-h" style="color:#c0392b;">قواعد عامة</p>
    <ol class="rule-list" dir="rtl">
      <li>يتم قبول المشروع أو رفضه بناءً على ما تقدم من معلومات ومدى أهمية المشروع من عدمه وفقاً لتخصص هندسة الذكاء الاصطناعي.</li>
      <li>يتم عمل تقييم للمشروع في الأسبوع السادس من الدراسة حيث يتم عقد لجنة استماع للمشاريع للتأكد من تحقيق المعايير، وفي حالة عدم تحقيق المعايير يتم إيقاف الدعم المالي للمشاريع التي حصلت على دعم وسيكون أقصى تقدير للطلاب B، ثم يتم إعادة تقييم مرة أخرى في الأسبوع الحادي عشر من الدراسة من خلال عقد لجنة استماع أخرى، وفي حالة تصحيح المسار وتحقيق المعايير فلن يكون هناك قيود على أقصى تقدير سيحصل عليه الطلاب.</li>
    </ol>
    <div class="decision-box">القرار النهائي للجنة المشاريع بالبرنامج<br/><span style="font-weight:400;font-size:11px;">قبول المشروع &nbsp; | &nbsp; رفض المشروع</span></div>
    ${pdfFoot(5)}`;
}

// Waits for every <img> inside a page (logos included) to finish loading
// before html2canvas takes its snapshot — otherwise fast page captures can
// grab a blank/broken logo if the image hasn't rendered yet.
function waitForImages(container) {
  const imgs = [...container.querySelectorAll("img")];
  return Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true }); // don't hang on a missing/broken logo
      });
    })
  );
}

async function buildPdf(refs, data) {
  renderPdfPages(refs, data);
  await new Promise((r) => setTimeout(r, 60));

  const pages = [refs.page1, refs.page2, refs.page3, refs.page4, refs.page5];
  await Promise.all(pages.map((p) => waitForImages(p.current)));

  const { default: html2canvas } = await import("html2canvas");
  const { jsPDF } = await import("jspdf");

  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;

  let pdf = null;

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i].current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const img = canvas.toDataURL("image/jpeg", 0.95);

    // Pages normally match standard A4, but page 1 can grow taller than the
    // template's default height when a team has many members (up to 11) —
    // rather than cropping the extra rows, the page itself grows to fit.
    const heightMM = Math.max(
      A4_HEIGHT_MM,
      (canvas.height / canvas.width) * A4_WIDTH_MM
    );

    if (i === 0) {
      pdf = new jsPDF({ orientation: "p", unit: "mm", format: [A4_WIDTH_MM, heightMM] });
    } else {
      pdf.addPage([A4_WIDTH_MM, heightMM]);
    }
    pdf.addImage(img, "JPEG", 0, 0, A4_WIDTH_MM, heightMM);
  }

  const safeName =
    (data.titleEn || "Project").replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "_") ||
    "Project";
  pdf.save(`${safeName}_Registration.pdf`);
}

/* ============================================================
   Component
============================================================ */
export default function ProjectRegistrationPage() {
  const formRef = useRef(null);
  const [ynAnswers, setYnAnswers] = useState(Array(YN_QUESTIONS.length).fill(""));
  const [printing, setPrinting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastErr, setToastErr] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [teamRows, setTeamRows] = useState(
    Array.from({ length: DEFAULT_TEAM_ROWS }, () => ({ name: "", hours: "", gpa: "" }))
  );

  function updateTeamRow(idx, field, value) {
    setTeamRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  }
  function addTeamRow() {
    setTeamRows((prev) =>
      prev.length >= MAX_TEAM ? prev : [...prev, { name: "", hours: "", gpa: "" }]
    );
  }
  function removeTeamRow(idx) {
    setTeamRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  const page1 = useRef(null);
  const page2 = useRef(null);
  const page3 = useRef(null);
  const page4 = useRef(null);
  const page5 = useRef(null);
  const refs = { page1, page2, page3, page4, page5 };

  function showToast(msg, isErr = false) {
    setToastMsg(msg);
    setToastErr(isErr);
    // Error messages can be longer (e.g. listing which team members are
    // short on hours), so give them more time on screen than a short
    // success confirmation.
    setTimeout(() => setToastMsg(null), isErr ? 6000 : 3200);
  }

  function collect() {
    const root = formRef.current;
    const val = (sel) => (root.querySelector(sel)?.value || "").trim();
    const vals = (sel) => [...root.querySelectorAll(sel)].map((i) => i.value.trim());

    const proj = PROJECT_OPTIONS.find((p) => p.id === selectedProject);

    return {
      courseTitle: proj ? `Project ${proj.id} — Requires ${proj.hours} Credit Hours` : "",
      requiredHours: proj ? proj.hours : null,
      titleAr: val("#titleAr"),
      titleEn: val("#titleEn"),
      supervisors: vals(".sup-name"),
      yn: ynAnswers,
      team: teamRows.map((r) => ({
        name: r.name.trim(),
        hours: r.hours.trim(),
        gpa: r.gpa.trim(),
      })),
      abstract: val("#abstract"),
      schedule: vals(".week-task"),
      sw: Object.fromEntries(
        [...root.querySelectorAll(".sw-input")].map((t) => [t.dataset.key, t.value])
      ),
      hardware: val("#hardware"),
      budget: vals(".budget-item").map((it, i) => ({
        item: it,
        price: vals(".budget-price")[i],
      })),
      sponsors: vals(".sponsor-name"),
    };
  }

  // Checks every filled-in team member against the selected project's
  // minimum completed-hours requirement. Returns an array of names that
  // don't meet it (empty array = everyone is eligible).
  function findIneligibleMembers(data) {
    if (!data.requiredHours) return [];
    return data.team
      .filter((m) => m.name) // ignore still-empty rows
      .filter((m) => {
        const hrs = parseFloat(m.hours);
        return isNaN(hrs) || hrs < data.requiredHours;
      })
      .map((m) => m.name);
  }

  async function handlePrint(e) {
    if (e) e.preventDefault();

    const data = collect();

    if (!data.requiredHours) {
      showToast("اختار المشروع (1 / 2 / 3) الأول قبل الطباعة", true);
      return;
    }

    const ineligible = findIneligibleMembers(data);
    if (ineligible.length > 0) {
      showToast(
        `مشروع ${selectedProject} محتاج ${data.requiredHours} ساعة معتمدة على الأقل — الأعضاء دول لسه ماوصلوش: ${ineligible.join("، ")}`,
        true
      );
      return;
    }

    setPrinting(true);
    try {
      await buildPdf(refs, data);
      showToast("✓ اتنزّل ملف الـ PDF بتصميم النموذج الرسمي");
    } catch (err) {
      console.error(err);
      showToast("حصل خطأ أثناء إنشاء الملف، حاول تاني", true);
    } finally {
      setPrinting(false);
    }
  }

  return (
    <section className="min-h-screen bg-[var(--bg)] px-6 pb-28 pt-40 transition-colors duration-300 md:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/25 bg-[var(--gold-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--gold)]">
            Project Registration
          </span>
          <h1 className="text-4xl font-black text-[var(--fg)] md:text-5xl">
            تسجيل مشروع التخرج
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[var(--fg-muted)]">
            سجّل بيانات مشروعك بالكامل، وبعدها دوس "طباعة PDF" — هيتحمّلك ملف
            مطابق لنموذج
            القسم الرسمي معبّى ببياناتك.
          </p>
        </div>

        <form ref={formRef} onSubmit={handlePrint} dir="rtl">
          <Card n="1" title="بيانات المشروع الأساسية" hint="اختار المشروع وعنوانه">
            <Field label="نوع المشروع" required>
              <div className="grid gap-3 sm:grid-cols-3">
                {PROJECT_OPTIONS.map((opt) => {
                  const active = selectedProject === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 px-4 py-4 text-center transition ${
                        active
                          ? "border-[var(--gold)] bg-[var(--gold-soft)]"
                          : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--gold)]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="courseProject"
                        value={opt.id}
                        checked={active}
                        onChange={() => setSelectedProject(opt.id)}
                        className="sr-only"
                        required
                      />
                      <span className="text-base font-extrabold text-[var(--fg)]">
                        {opt.label}
                      </span>
                      <span className="text-xs text-[var(--fg-muted)]">
                        يلزم إتمام {opt.hours} ساعة معتمدة
                      </span>
                    </label>
                  );
                })}
              </div>
            </Field>
            <Field label="عنوان المشروع باللغة العربية" required>
              <input id="titleAr" type="text" className="rt-input" placeholder="مثال: المساعد الذكي لأنظمة إدارة المؤسسات (ERP)" required />
            </Field>
            <Field label="Project Title (English)" required>
              <input id="titleEn" type="text" className="rt-input" dir="ltr" placeholder="e.g. Talk2Data (AI-Powered ERP Assistant)" required />
            </Field>
          </Card>

          <Card n="2" title="فريق الإشراف" hint="حتى 3 أسماء">
            <table className="rt-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>م</th>
                  <th>الاسم</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="rt-center">{i}</td>
                    <td>
                      <input type="text" className="sup-name rt-cell-input" placeholder="د/ ..." />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card n="3" title="معلومات أساسية عن مقترح المشروع" hint="جاوب بنعم أو لا على كل سؤال">
            {YN_QUESTIONS.map((q, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 border-b border-dashed border-[var(--border)] py-3 last:border-b-0"
              >
                <p className="flex-1 text-sm">
                  {i + 1}. {q}
                </p>
                <div className="flex shrink-0 gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] p-1">
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...ynAnswers];
                      next[i] = "yes";
                      setYnAnswers(next);
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      ynAnswers[i] === "yes"
                        ? "bg-emerald-600 text-white"
                        : "text-[var(--fg-muted)]"
                    }`}
                  >
                    نعم
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...ynAnswers];
                      next[i] = "no";
                      setYnAnswers(next);
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      ynAnswers[i] === "no" ? "bg-red-600 text-white" : "text-[var(--fg-muted)]"
                    }`}
                  >
                    لا
                  </button>
                </div>
              </div>
            ))}
          </Card>

          <Card
            n="4"
            title="فريق المشروع (Project Team)"
            hint={`حتى ${MAX_TEAM} أعضاء`}
          >
            <table className="rt-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>م</th>
                  <th>الاسم رباعي</th>
                  <th style={{ width: 120 }}>الساعات المكتسبة</th>
                  <th style={{ width: 90 }}>GPA</th>
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {teamRows.map((row, i) => (
                  <tr key={i}>
                    <td className="rt-center">{i + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="rt-cell-input"
                        placeholder="الاسم رباعي"
                        value={row.name}
                        onChange={(e) => updateTeamRow(i, "name", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="rt-cell-input"
                        placeholder="124"
                        value={row.hours}
                        onChange={(e) => updateTeamRow(i, "hours", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="rt-cell-input"
                        placeholder="3.5"
                        value={row.gpa}
                        onChange={(e) => updateTeamRow(i, "gpa", e.target.value)}
                      />
                    </td>
                    <td className="rt-center">
                      {teamRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTeamRow(i)}
                          aria-label="حذف العضو"
                          className="text-red-500 transition hover:text-red-700"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {teamRows.length < MAX_TEAM && (
              <button
                type="button"
                onClick={addTeamRow}
                className="mt-3 rounded-full border border-[var(--gold)]/30 bg-[var(--gold-soft)] px-4 py-2 text-xs font-bold text-[var(--gold)] transition hover:bg-[var(--gold)] hover:text-[var(--on-gold)]"
              >
                + إضافة عضو ({teamRows.length}/{MAX_TEAM})
              </button>
            )}
          </Card>

          <Card n="5" title="Project Abstract" hint="ملخص المشروع بالإنجليزية">
            <Field>
              <textarea
                id="abstract"
                dir="ltr"
                className="rt-input"
                style={{ minHeight: 180 }}
                placeholder="Write the full project abstract here..."
                required
              />
            </Field>
          </Card>

          <Card n="6" title="Time Schedule" hint="8 أسابيع — اكتب مهام مشروعك">
            {SCHEDULE_HINTS.map((hint, i) => (
              <div key={i} className="mb-2 grid grid-cols-[90px_1fr] items-center gap-3">
                <span className="rounded-lg bg-[var(--surface-soft)] py-2 text-center text-xs font-extrabold text-[var(--navy)] dark:text-[var(--gold)]">
                  Week {i + 1}
                </span>
                <input
                  type="text"
                  className="week-task rt-input"
                  dir="ltr"
                  placeholder={hint}
                />
              </div>
            ))}
          </Card>

          <Card n="7" title="Required Software Tools" hint="اكتب أدوات مشروعك في كل قسم">
            {SW_CATS.map((cat) => (
              <div key={cat.key} className="mb-4">
                <label className="mb-1.5 block text-sm font-extrabold text-[var(--navy)] dark:text-[var(--gold)]">
                  {cat.label}
                </label>
                <textarea
                  className="sw-input rt-input"
                  data-key={cat.key}
                  dir="ltr"
                  style={{ minHeight: 66 }}
                  placeholder={cat.hint}
                />
              </div>
            ))}
          </Card>

          <Card n="8" title="Required Hardware Tools">
            <Field>
              <textarea
                id="hardware"
                dir="ltr"
                className="rt-input"
                style={{ minHeight: 110 }}
                placeholder={HARDWARE_HINT}
              />
            </Field>
          </Card>

          <Card n="9" title="Budget Analysis" hint="الإجمالي بيتحسب أوتوماتيك لو الأسعار أرقام">
            <table className="rt-table" dir="ltr">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No.</th>
                  <th>Item</th>
                  <th style={{ width: 160 }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i}>
                    <td className="rt-center">{i}</td>
                    <td>
                      <input
                        type="text"
                        className="budget-item rt-cell-input"
                        dir="ltr"
                        placeholder="Item"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="budget-price rt-cell-input"
                        dir="ltr"
                        placeholder="Price"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card n="10" title="Sponsors">
            <table className="rt-table" dir="ltr">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No.</th>
                  <th>Sponsor</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="rt-center">{i}</td>
                    <td>
                      <input type="text" className="sponsor-name rt-cell-input" dir="ltr" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="sticky bottom-6 flex flex-wrap justify-center gap-3">
            <button
              type="submit"
              disabled={printing}
              className="flex items-center gap-2 rounded-full bg-[var(--navy)] px-10 py-4 font-extrabold text-white shadow-xl shadow-[var(--shadow-color)] transition hover:-translate-y-0.5 hover:bg-[var(--navy-light)] disabled:cursor-wait disabled:opacity-60"
            >
              {printing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  جارِ التجهيز...
                </>
              ) : (
                <>🖨️ طباعة PDF بنفس تصميم النموذج</>
              )}
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--fg-subtle)]">
            بينزّل النموذج معبّى ببياناتك الحالية مباشرة بنفس تصميم وترتيب
            النموذج الرسمي.
          </p>
        </form>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-xl px-6 py-3.5 text-center text-sm font-bold leading-relaxed text-white shadow-2xl ${
            toastErr ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {toastMsg}
        </div>
      )}

      {/* Hidden PDF pages captured by html2canvas */}
      <div style={{ position: "absolute", left: -99999, top: 0 }}>
        <div className="pg" ref={page1} />
        <div className="pg" ref={page2} />
        <div className="pg" ref={page3} />
        <div className="pg" ref={page4} />
        <div className="pg" ref={page5} />
      </div>

      {/* Scoped styles: form inputs + PDF page replica */}
      <style jsx global>{`
        .rt-input {
          width: 100%;
          padding: 11px 13px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--surface-soft);
          color: var(--fg);
          font: inherit;
          font-size: 14px;
          transition: 0.2s;
        }
        .rt-input:focus {
          outline: none;
          border-color: var(--gold);
          background: var(--surface);
        }
        .rt-table {
          width: 100%;
          border-collapse: collapse;
        }
        .rt-table th {
          background: var(--surface-soft);
          font-size: 12px;
          color: var(--fg-muted);
          padding: 8px;
          border: 1px solid var(--border);
          font-weight: 700;
        }
        .rt-table td {
          border: 1px solid var(--border);
          padding: 4px;
        }
        .rt-cell-input {
          width: 100%;
          border: none;
          background: transparent;
          padding: 8px 6px;
          color: var(--fg);
          font: inherit;
        }
        .rt-cell-input:focus {
          outline: none;
          background: var(--gold-soft);
          border-radius: 6px;
        }
        .rt-center {
          text-align: center;
        }

        /* ---- PDF page replica (fixed institutional look, not theme-dependent) ---- */
        .pg {
          width: 794px;
          min-height: 1123px;
          height: auto;
          background: #fff;
          color: #111;
          font-family: Arial, Tahoma, sans-serif;
          border: 3px solid #7a3fa0;
          box-sizing: border-box;
          padding: 22px 30px 60px;
          position: relative;
        }
        .pg-head {
          border: 1.5px solid #b03060;
          border-radius: 10px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 6px;
        }
        .pg-logo {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: contain;
          background: #ffffff;
          flex-shrink: 0;
          border: 2px solid #b88a2b;
        }
        .pg-head-text {
          flex: 1;
          text-align: center;
        }
        .pg-head-text .t1 {
          color: #b03060;
          font-size: 19px;
          font-weight: 900;
          margin: 0;
        }
        .pg-head-text .t2 {
          color: #06265b;
          font-size: 12px;
          font-weight: 700;
          margin: 2px 0 0;
        }
        .pg-rule {
          height: 2px;
          background: #c0392b;
          margin: 2px 0 14px;
          position: relative;
        }
        .pg-title {
          text-align: center;
          font-size: 16px;
          font-weight: 900;
          color: #c0392b;
          text-decoration: underline;
          margin: 6px 0 16px;
        }
        .sec-h {
          font-size: 13.5px;
          font-weight: 900;
          color: #1a4fa0;
          text-decoration: underline;
          margin: 14px 0 8px;
        }
        .pg table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          font-size: 11.5px;
        }
        .pg th {
          background: #dbe4f0;
          border: 1px solid #9aa8bd;
          padding: 6px 8px;
          font-weight: 800;
          color: #06265b;
        }
        .pg td {
          border: 1px solid #c7d0dc;
          padding: 6px 8px;
          color: #111;
        }
        .pg .arb {
          text-align: right;
        }
        .pg .center {
          text-align: center;
        }
        .abs-box {
          border: 1px solid #9aa8bd;
          border-radius: 2px;
        }
        .abs-box .abs-h {
          background: #dbe4f0;
          text-align: center;
          font-weight: 800;
          padding: 6px;
          font-size: 13px;
          color: #06265b;
          border-bottom: 1px solid #9aa8bd;
        }
        .abs-box .abs-body {
          padding: 16px 18px;
          font-size: 12px;
          line-height: 1.85;
          text-align: justify;
        }
        .abs-body p {
          margin: 0 0 10px;
        }
        .pg-foot {
          position: absolute;
          left: 26px;
          right: 26px;
          bottom: 14px;
          border-top: 2px solid #c0392b;
          padding-top: 6px;
          font-size: 9px;
          text-align: center;
          color: #111;
        }
        .pg-foot b {
          color: #c0392b;
        }
        .pg-foot .links {
          display: flex;
          justify-content: space-between;
          margin-top: 2px;
          font-weight: 700;
          color: #06265b;
        }
        .pg-foot .pagenum {
          margin-top: 2px;
          font-weight: 800;
        }
        .rule-list {
          font-size: 11.5px;
          text-align: right;
          line-height: 1.9;
        }
        .rule-list li {
          margin-bottom: 8px;
        }
        .decision-box {
          border: 1.5px solid #9aa8bd;
          border-radius: 8px;
          padding: 14px;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: #06265b;
          background: #eef2f8;
        }
      `}</style>
    </section>
  );
}

/* ============================================================
   Small layout helpers
============================================================ */
function Card({ n, title, hint, children }) {
  return (
    <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="mb-1 flex items-center gap-2.5 text-base font-bold text-[var(--fg)]">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--navy)] text-xs font-extrabold text-white">
          {n}
        </span>
        {title}
      </h2>
      {hint && <p className="mb-4 mr-8 text-xs text-[var(--fg-subtle)]">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-sm font-bold text-[var(--fg)]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}
