"use client";

import { useEffect, useRef, useState } from "react";

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
    key: "speech",
    label: "Speech Processing",
    hint: "e.g. Speech-to-Text (STT) APIs\nText-to-Speech (TTS) — if applicable",
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

const MAX_TEAM = 8;
const DEFAULT_TEAM_ROWS = 5;

// Registration eligibility rules:
// - `hours` is the normal minimum completed credit hours required.
// - `grace` is how many hours BELOW that minimum are still tolerated, but
//   only through a manual/paper registration at the department (not
//   through this online form) — see findEligibility() below.
const PROJECT_OPTIONS = [
  { id: 1, label: "مشروع 1", hours: 96, grace: 4 },
  { id: 2, label: "مشروع 2", hours: 116, grace: 4 },
  { id: 3, label: "مشروع 3", hours: 130, grace: 6 },
];

// Word-count limits. Abstract is meant to fill roughly half a page to a
// full page of the template (~150–300 words at standard A4/Arial sizing);
// the three short-answer fields are meant to stay to a tight paragraph.
const ABSTRACT_MIN_WORDS = 150;
const ABSTRACT_MAX_WORDS = 300;
const GOAL_MAX_WORDS = 60;
const AI_LINK_MAX_WORDS = 60;
const COMMUNITY_MAX_WORDS = 60;

const KEYWORD_OPTIONS = [
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Generative AI",
  "Large Language Models",
  "Reinforcement Learning",
  "Data Science",
  "Big Data",
  "Robotics",
  "Internet of Things (IoT)",
  "Embedded Systems",
  "Cloud Computing",
  "Cybersecurity",
  "Blockchain",
  "Speech Recognition",
  "Recommendation Systems",
  "Computer Networks",
  "Database Systems",
  "Web Development",
  "Mobile Applications",
  "Software Engineering",
];

function countWords(str) {
  return (str || "").trim().split(/\s+/).filter(Boolean).length;
}

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
    <div class="pagenum">Page ${n} of 6</div>
  </div>`;
}

// A boxed section styled exactly like the Abstract box (gray header bar +
// padded, justified body) — reused for Goal / AI-link / Community-service
// so they all look consistent instead of a plain heading + paragraph.
function boxedSection(title, text, { rtl = true } = {}) {
  const paragraphs = (text || "")
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
  return `<div class="abs-box" style="margin-bottom:16px;">
    <div class="abs-h">${title}</div>
    <div class="abs-body${rtl ? " arb" : ""}" style="text-align:${rtl ? "right" : "justify"};">${paragraphs}</div>
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

    <p class="sec-h">قائد فريق المشروع (Team Leader)</p>
    <table dir="rtl">
      <thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th style="width:120px;">رقم الموبايل</th></tr></thead>
      <tbody><tr><td class="arb">${esc(data.leaderName)}</td><td>${esc(data.leaderEmail)}</td><td class="center">${esc(data.leaderPhone)}</td></tr></tbody>
    </table>
    ${pdfFoot(1)}`;

  // Dedicated page for the goal / AI-link / community-service / keywords —
  // each boxed exactly like the Abstract, with its own room to breathe
  // instead of being crammed at the bottom of page 1.
  refs.page2.current.innerHTML = `
    ${pdfHead()}
    <p class="pg-title" style="font-size:14px;">PROJECT RATIONALE &amp; KEYWORDS</p>
    ${boxedSection("الهدف من المشروع", data.goal)}
    ${boxedSection("ربط المشروع بتخصص هندسة الذكاء الاصطناعي", data.aiLink)}
    ${boxedSection("ربط المشروع بالخدمة المجتمعية", data.communityService)}
    <div class="abs-box">
      <div class="abs-h">الكلمات المفتاحية (Keywords)</div>
      <div class="abs-body" style="text-align:center;">
        ${(data.keywords || [])
          .map(
            (k) =>
              `<span style="display:inline-block;margin:3px 5px;padding:4px 12px;border-radius:14px;background:#eef2f8;border:1px solid #9aa8bd;font-size:11px;font-weight:700;color:#06265b;">${esc(k)}</span>`
          )
          .join("")}
      </div>
    </div>
    ${pdfFoot(2)}`;

  refs.page3.current.innerHTML = `
    ${pdfHead()}
    <p class="sec-h">PROJECT ABSTRACT:</p>
    <div class="abs-box">
      <div class="abs-h">Abstract</div>
      <div class="abs-body">${(data.abstract || "")
        .split(/\n{2,}/)
        .map((p) => `<p>${esc(p)}</p>`)
        .join("")}</div>
    </div>
    ${pdfFoot(3)}`;

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

  refs.page4.current.innerHTML = `
    ${pdfHead()}
    <p class="sec-h">TIME SCHEDULE:</p>
    <table><thead><tr><th style="width:90px;">Week</th><th>Task</th></tr></thead><tbody>${schedRows}</tbody></table>
    <p class="sec-h">REQUIRED SOFTWARE TOOLS:</p>
    <table><thead><tr><th style="width:36px;">No.</th><th>Software Tools</th></tr></thead><tbody>${swFirst}</tbody></table>
    ${pdfFoot(4)}`;

  const swRest = SW_CATS.slice(4)
    .map(
      (c, i) =>
        `<tr><td class="center" style="width:36px;">${i + 5}</td><td><b>${c.label}:</b><br/>${bulletList(data.sw[c.key])}</td></tr>`
    )
    .join("");

  refs.page5.current.innerHTML = `
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
    ${pdfFoot(5)}`;

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

  refs.page6.current.innerHTML = `
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
    ${pdfFoot(6)}`;
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

  const pages = [refs.page1, refs.page2, refs.page3, refs.page4, refs.page5, refs.page6];
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

  // Returns the jsPDF instance instead of saving directly, so the caller
  // can (a) trigger the browser download for the student AND
  // (b) also send a copy to the admin's inbox via the API route below.
  return { pdf, safeName };
}

// POSTs the filled data + the generated PDF (as base64) to our own API
// route, which emails a copy to the admin. This never blocks or fails the
// student's download — if the email can't be sent (e.g. SMTP isn't
// configured yet on the server), we just log it and let the person know.
async function sendCopyToAdmin(data, pdf) {
  const pdfBase64 = pdf.output("datauristring");
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, pdfBase64 }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Email relay failed");
  }
}

/* ============================================================
   Component
============================================================ */
export default function ProjectRegistrationPage() {
  const [verified, setVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const formRef = useRef(null);
  const [ynAnswers, setYnAnswers] = useState(Array(YN_QUESTIONS.length).fill(""));
  const [printing, setPrinting] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm } | null
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

  // Team leader contact info
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");

  // Pre-fill the leader's email with the verified university address —
  // the person can still edit it, but it saves a step in the common case.
  useEffect(() => {
    if (verifiedEmail && !leaderEmail) setLeaderEmail(verifiedEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedEmail]);

  const [leaderPhone, setLeaderPhone] = useState("");

  // Word-count-limited fields (controlled, so we can show a live counter)
  const [abstractText, setAbstractText] = useState("");
  const [goalText, setGoalText] = useState("");
  const [aiLinkText, setAiLinkText] = useState("");
  const [communityText, setCommunityText] = useState("");

  // Keywords multi-select dropdown
  const [keywords, setKeywords] = useState([]);
  const [keywordsOpen, setKeywordsOpen] = useState(false);
  function toggleKeyword(kw) {
    setKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  }

  const page1 = useRef(null);
  const page2 = useRef(null);
  const page3 = useRef(null);
  const page4 = useRef(null);
  const page5 = useRef(null);
  const page6 = useRef(null);
  const refs = { page1, page2, page3, page4, page5, page6 };

  function showToast(msg, isErr = false) {
    setToastMsg(msg);
    setToastErr(isErr);
    // Error messages can now include the real SMTP/nodemailer error text
    // (host/port/login details), which can get long — give it much more
    // time on screen than a short success confirmation, and let the person
    // dismiss it early by tapping it.
    setTimeout(() => setToastMsg(null), isErr ? 12000 : 3200);
  }

  function collect() {
    const root = formRef.current;
    const val = (sel) => (root.querySelector(sel)?.value || "").trim();
    const vals = (sel) => [...root.querySelectorAll(sel)].map((i) => i.value.trim());

    const proj = PROJECT_OPTIONS.find((p) => p.id === selectedProject);

    return {
      courseTitle: proj ? `Project ${proj.id} — Requires ${proj.hours} Credit Hours` : "",
      requiredHours: proj ? proj.hours : null,
      grace: proj ? proj.grace : null,
      titleAr: val("#titleAr"),
      titleEn: val("#titleEn"),
      supervisors: vals(".sup-name"),
      yn: ynAnswers,
      team: teamRows.map((r) => ({
        name: r.name.trim(),
        hours: r.hours.trim(),
        gpa: r.gpa.trim(),
      })),
      leaderName: leaderName.trim(),
      leaderEmail: leaderEmail.trim(),
      leaderPhone: leaderPhone.trim(),
      goal: goalText.trim(),
      aiLink: aiLinkText.trim(),
      communityService: communityText.trim(),
      keywords,
      abstract: abstractText.trim(),
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

  // Every part of the form is mandatory — this checks all of it and
  // returns a list of what's still missing (empty array = complete).
  function getMissingFields(data) {
    const missing = [];

    if (!data.requiredHours) missing.push("اختيار المشروع (1/2/3)");
    if (!data.titleAr) missing.push("عنوان المشروع بالعربي");
    if (!data.titleEn) missing.push("Project Title بالإنجليزي");
    if (data.supervisors.some((s) => !s)) missing.push("كل أسماء فريق الإشراف");
    if (data.yn.some((a) => !a)) missing.push("الإجابة على كل الأسئلة (نعم/لا)");

    if (
      data.team.some((t) => !t.name || !t.hours || !t.gpa)
    ) {
      missing.push("بيانات كل عضو في فريق المشروع (الاسم/الساعات/GPA) — احذف أي صف فاضي لو مش محتاجه");
    }

    if (!data.leaderName) missing.push("اسم قائد الفريق");
    if (!data.leaderEmail) missing.push("بريد قائد الفريق الإلكتروني");
    if (!data.leaderPhone) missing.push("رقم موبايل قائد الفريق");

    if (!data.goal) missing.push("الهدف من المشروع");
    if (!data.aiLink) missing.push("ربط المشروع بتخصص هندسة الذكاء الاصطناعي");
    if (!data.communityService) missing.push("ربط المشروع بالخدمة المجتمعية");
    if (!data.keywords.length) missing.push("الكلمات المفتاحية (اختار كلمة واحدة على الأقل)");
    if (!data.abstract) missing.push("Project Abstract");

    if (data.schedule.some((t) => !t)) missing.push("كل مهام Time Schedule (8 أسابيع)");
    if (Object.values(data.sw).some((v) => !v.trim())) missing.push("كل أقسام Software Tools");
    if (!data.hardware) missing.push("Hardware Tools");
    if (data.budget.some((b) => !b.item || !b.price)) missing.push("كل بنود Budget Analysis");
    if (data.sponsors.some((s) => !s)) missing.push("كل بيانات Sponsors");

    return missing;
  }

  // Word-count rules (item 2, 3, 4, 5 of the requirements)
  function getWordCountErrors(data) {
    const errors = [];
    const abstractWords = countWords(data.abstract);
    if (abstractWords < ABSTRACT_MIN_WORDS || abstractWords > ABSTRACT_MAX_WORDS) {
      errors.push(
        `الـ Abstract لازم يكون بين ${ABSTRACT_MIN_WORDS} و ${ABSTRACT_MAX_WORDS} كلمة (حاليًا ${abstractWords} كلمة)`
      );
    }
    if (countWords(data.goal) > GOAL_MAX_WORDS) {
      errors.push(`"الهدف من المشروع" أكتر من ${GOAL_MAX_WORDS} كلمة`);
    }
    if (countWords(data.aiLink) > AI_LINK_MAX_WORDS) {
      errors.push(`"ربط المشروع بالتخصص" أكتر من ${AI_LINK_MAX_WORDS} كلمة`);
    }
    if (countWords(data.communityService) > COMMUNITY_MAX_WORDS) {
      errors.push(`"ربط المشروع بالخدمة المجتمعية" أكتر من ${COMMUNITY_MAX_WORDS} كلمة`);
    }
    return errors;
  }

  // Checks every filled-in team member's hours against the selected
  // project's requirement, honoring the small "grace window" below the
  // normal minimum (item 8): inside that window, online registration is
  // blocked and the person must register on paper at the department
  // instead of being silently allowed or silently rejected.
  function checkEligibility(data) {
    const belowGrace = []; // too short even for the grace window — fully blocked
    const inGraceZone = []; // within the grace window — needs paper registration

    data.team
      .filter((m) => m.name)
      .forEach((m) => {
        const hrs = parseFloat(m.hours);
        if (isNaN(hrs) || hrs < data.requiredHours - data.grace) {
          belowGrace.push(m.name);
        } else if (hrs < data.requiredHours) {
          inGraceZone.push(m.name);
        }
      });

    if (belowGrace.length > 0) return { status: "blocked", names: belowGrace };
    if (inGraceZone.length > 0) return { status: "paper", names: inGraceZone };
    return { status: "ok", names: [] };
  }

  // Actually builds, downloads, and emails the PDF — shared by the normal
  // path and by the "confirm anyway" path from the paper-registration
  // warning dialog below.
  async function generateAndSend(data) {
    setPrinting(true);
    try {
      const { pdf, safeName } = await buildPdf(refs, data);
      pdf.save(`${safeName}_Registration.pdf`);

      try {
        await sendCopyToAdmin(data, pdf);
        showToast("✓ اتنزّل الملف عندك، ووصلت نسخة لإدارة القسم كمان");
      } catch (mailErr) {
        console.error(mailErr);
        showToast(
          `✓ اتنزّل الملف عندك، لكن نسخة الإدارة ماوصلتش: ${mailErr.message}`,
          true
        );
      }
    } catch (err) {
      console.error(err);
      showToast("حصل خطأ أثناء إنشاء الملف، حاول تاني", true);
    } finally {
      setPrinting(false);
    }
  }

  async function handlePrint(e) {
    if (e) e.preventDefault();

    const data = collect();

    const missing = getMissingFields(data);
    if (missing.length > 0) {
      showToast(`لسه فاضل تعبّي: ${missing.slice(0, 4).join("، ")}${missing.length > 4 ? " …" : ""}`, true);
      return;
    }

    const wordErrors = getWordCountErrors(data);
    if (wordErrors.length > 0) {
      showToast(wordErrors.join(" — "), true);
      return;
    }

    const eligibility = checkEligibility(data);

    if (eligibility.status === "blocked") {
      showToast(
        `مشروع ${selectedProject} محتاج ${data.requiredHours} ساعة معتمدة على الأقل — الأعضاء دول لسه بعيدين: ${eligibility.names.join("، ")}`,
        true
      );
      return;
    }

    if (eligibility.status === "paper") {
      // Don't block — warn, and let the person confirm they'll still
      // follow up with a paper registration at the department.
      setConfirmModal({
        message: `الأعضاء دول (${eligibility.names.join("، ")}) ساعاتهم أقل من المطلوب لمشروع ${selectedProject} لكن ضمن هامش السماح — لازم التوجه لإدارة القسم لطلب تسجيل ورقي بعد توقيعه من المرشد الأكاديمي وتسليمه لإدارة البرنامج.`,
        onConfirm: () => {
          setConfirmModal(null);
          generateAndSend(data);
        },
      });
      return;
    }

    await generateAndSend(data);
  }

  // The real access control happens server-side on every /api/register
  // request (via the signed cookie) — this client-side gate is just UX:
  // it hides the (long) form until the email is verified.
  if (!verified) {
    return (
      <EmailGate
        onVerified={(email) => {
          setVerified(true);
          setVerifiedEmail(email);
        }}
      />
    );
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
          <p className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
            ✓ متحقق كـ {verifiedEmail}
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

          <Card n="2" title="فريق الإشراف" hint="حتى 3 أسماء — كلها مطلوبة">
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
                      <input type="text" className="sup-name rt-cell-input" placeholder="د/ ..." required />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card n="3" title="معلومات أساسية عن مقترح المشروع" hint="جاوب بنعم أو لا على كل سؤال — كلها مطلوبة">
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
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="rt-cell-input"
                        placeholder="124"
                        value={row.hours}
                        onChange={(e) => updateTeamRow(i, "hours", e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="rt-cell-input"
                        placeholder="3.5"
                        value={row.gpa}
                        onChange={(e) => updateTeamRow(i, "gpa", e.target.value)}
                        required
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

          <Card n="5" title="قائد فريق المشروع (Team Leader)" hint="مسؤول التواصل بخصوص المشروع">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="اسم قائد الفريق" required>
                <input
                  type="text"
                  className="rt-input"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  required
                />
              </Field>
              <Field label="البريد الإلكتروني" required>
                <input
                  type="email"
                  dir="ltr"
                  className="rt-input"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="رقم الموبايل" required>
                <input
                  type="tel"
                  dir="ltr"
                  className="rt-input"
                  value={leaderPhone}
                  onChange={(e) => setLeaderPhone(e.target.value)}
                  required
                />
              </Field>
            </div>
          </Card>

          <Card n="6" title="Project Abstract" hint={`ملخص المشروع بالإنجليزية — بين ${ABSTRACT_MIN_WORDS} و ${ABSTRACT_MAX_WORDS} كلمة`}>
            <Field required>
              <textarea
                dir="ltr"
                className="rt-input"
                style={{ minHeight: 180 }}
                placeholder="Write the full project abstract here..."
                value={abstractText}
                onChange={(e) => setAbstractText(e.target.value)}
                required
              />
              <WordCounter
                count={countWords(abstractText)}
                min={ABSTRACT_MIN_WORDS}
                max={ABSTRACT_MAX_WORDS}
              />
            </Field>
          </Card>

          <Card n="7" title="الهدف من المشروع" hint={`حد أقصى ${GOAL_MAX_WORDS} كلمة`}>
            <Field required>
              <textarea
                className="rt-input"
                style={{ minHeight: 90 }}
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                required
              />
              <WordCounter count={countWords(goalText)} max={GOAL_MAX_WORDS} />
            </Field>
          </Card>

          <Card n="8" title="ربط المشروع بتخصص هندسة الذكاء الاصطناعي" hint={`حد أقصى ${AI_LINK_MAX_WORDS} كلمة`}>
            <Field required>
              <textarea
                className="rt-input"
                style={{ minHeight: 90 }}
                value={aiLinkText}
                onChange={(e) => setAiLinkText(e.target.value)}
                required
              />
              <WordCounter count={countWords(aiLinkText)} max={AI_LINK_MAX_WORDS} />
            </Field>
          </Card>

          <Card n="9" title="ربط المشروع بالخدمة المجتمعية" hint={`حد أقصى ${COMMUNITY_MAX_WORDS} كلمة`}>
            <Field required>
              <textarea
                className="rt-input"
                style={{ minHeight: 90 }}
                value={communityText}
                onChange={(e) => setCommunityText(e.target.value)}
                required
              />
              <WordCounter count={countWords(communityText)} max={COMMUNITY_MAX_WORDS} />
            </Field>
          </Card>

          <Card n="10" title="الكلمات المفتاحية (Keywords)" hint="اختار كلمة واحدة على الأقل">
            <div className="relative">
              <button
                type="button"
                onClick={() => setKeywordsOpen((o) => !o)}
                className="rt-input flex min-h-[46px] w-full flex-wrap items-center gap-1.5 text-right"
              >
                {keywords.length === 0 ? (
                  <span className="text-[var(--fg-subtle)]">اختار من القائمة...</span>
                ) : (
                  keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-full bg-[var(--gold-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--gold)]"
                    >
                      {k}
                    </span>
                  ))
                )}
              </button>

              {keywordsOpen && (
                <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                  {KEYWORD_OPTIONS.map((kw) => (
                    <label
                      key={kw}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-[var(--surface-soft)]"
                    >
                      <input
                        type="checkbox"
                        checked={keywords.includes(kw)}
                        onChange={() => toggleKeyword(kw)}
                        className="accent-[var(--gold)]"
                      />
                      <span className="text-[var(--fg)]">{kw}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {keywordsOpen && (
              <button
                type="button"
                onClick={() => setKeywordsOpen(false)}
                className="mt-2 text-xs font-semibold text-[var(--gold)]"
              >
                تم — اقفل القائمة
              </button>
            )}
          </Card>

          <Card n="11" title="Time Schedule" hint="8 أسابيع — كل أسبوع مطلوب">
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
                  required
                />
              </div>
            ))}
          </Card>

          <Card n="12" title="Required Software Tools" hint="اكتب أدوات مشروعك في كل قسم — كل الأقسام مطلوبة">
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
                  required
                />
              </div>
            ))}
          </Card>

          <Card n="13" title="Required Hardware Tools" hint="مطلوب">
            <Field>
              <textarea
                id="hardware"
                dir="ltr"
                className="rt-input"
                style={{ minHeight: 110 }}
                placeholder={HARDWARE_HINT}
                required
              />
            </Field>
          </Card>

          <Card n="14" title="Budget Analysis" hint="كل الـ 6 بنود مطلوبة — الإجمالي بيتحسب أوتوماتيك لو الأسعار أرقام">
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
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="budget-price rt-cell-input"
                        dir="ltr"
                        placeholder="Price"
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card n="15" title="Sponsors" hint="كل الـ 3 صفوف مطلوبة">
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
                      <input type="text" className="sponsor-name rt-cell-input" dir="ltr" required />
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
                <>🖨️ سجّل المشروع ونزّل الـ PDF</>
              )}
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--fg-subtle)]">
            هيتنزّل عندك ملف PDF بنفس تصميم النموذج الرسمي، وفي نفس الوقت
            هتوصل نسخة منه لإدارة القسم أوتوماتيك.
          </p>
        </form>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div
          onClick={() => setToastMsg(null)}
          className={`fixed bottom-6 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 cursor-pointer rounded-xl px-6 py-3.5 text-center text-sm font-bold leading-relaxed text-white shadow-2xl ${
            toastErr ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {toastMsg}
        </div>
      )}

      {/* Confirm dialog — used for the "paper registration" warning:
          the person can still confirm and proceed with the online print. */}
      {confirmModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6"
          onClick={() => setConfirmModal(null)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="mb-3 flex items-center gap-2 text-red-600">
              <span className="text-xl">⚠️</span>
              <h3 className="text-base font-extrabold">تنبيه قبل الطباعة</h3>
            </div>
            <p className="mb-6 text-sm leading-7 text-[var(--fg)]">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-bold text-[var(--fg-muted)] transition hover:bg-[var(--border)]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                تأكيد وطباعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden PDF pages captured by html2canvas */}
      <div style={{ position: "absolute", left: -99999, top: 0 }}>
        <div className="pg" ref={page1} />
        <div className="pg" ref={page2} />
        <div className="pg" ref={page3} />
        <div className="pg" ref={page4} />
        <div className="pg" ref={page5} />
        <div className="pg" ref={page6} />
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

function WordCounter({ count, min, max }) {
  const tooShort = min != null && count < min;
  const tooLong = count > max;
  const outOfRange = tooShort || tooLong;

  return (
    <p
      className={`mt-1.5 text-right text-xs font-semibold ${
        outOfRange ? "text-red-500" : "text-[var(--fg-subtle)]"
      }`}
    >
      {count} / {max} كلمة
      {min != null ? ` (الحد الأدنى ${min})` : ""}
      {outOfRange && " ⚠"}
    </p>
  );
}

/* ============================================================
   Email verification gate — university email + OTP.
   The real enforcement is server-side (signed cookie checked by
   /api/register); this component is the UX for getting that cookie.
============================================================ */
function EmailGate({ onVerified }) {
  const [step, setStep] = useState("email"); // "email" | "code"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode(e) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "حصل خطأ");
      setStep("code");
      setCooldown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "الكود غلط");
      onVerified(body.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 transition-colors duration-300">
      <div
        dir="rtl"
        className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:p-10"
      >
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/25 bg-[var(--gold-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--gold)]">
          🔒 تحقق مطلوب
        </span>

        <h1 className="mb-2 text-2xl font-black text-[var(--fg)]">
          تسجيل مشروع التخرج
        </h1>
        <p className="mb-7 text-sm text-[var(--fg-muted)]">
          {step === "email"
            ? "من فضلك أكّد إيميلك الجامعي الأول قبل ما تبدأ التسجيل."
            : `بعتنالك كود من 6 أرقام على ${email} — اكتبه هنا.`}
        </p>

        {step === "email" ? (
          <form onSubmit={sendCode}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@std.mans.edu.eg"
              dir="ltr"
              required
              autoFocus
              className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--gold)]"
            />

            {error && <p className="mb-4 text-sm font-semibold text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--navy)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--navy-light)] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  جارِ الإرسال...
                </>
              ) : (
                "ابعتلي كود التحقق"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              dir="ltr"
              required
              autoFocus
              className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3.5 text-center text-2xl font-black tracking-[0.5em] text-[var(--fg)] outline-none focus:border-[var(--gold)]"
            />

            {error && <p className="mb-4 text-sm font-semibold text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--navy)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--navy-light)] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  جارِ التحقق...
                </>
              ) : (
                "تأكيد الكود"
              )}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                }}
                className="font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                ← غيّر الإيميل
              </button>

              <button
                type="button"
                onClick={sendCode}
                disabled={cooldown > 0 || loading}
                className="font-semibold text-[var(--gold)] disabled:text-[var(--fg-subtle)]"
              >
                {cooldown > 0 ? `أعد الإرسال بعد ${cooldown}s` : "أعد إرسال الكود"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
