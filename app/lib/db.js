import { neon } from "@neondatabase/serverless";

// ─────────────────────────────────────────────────────────────
// Postgres (Neon) — بديل SQLite.
// ليه اتغيّر؟ Vercel بيشغّل الكود على serverless functions: مفيش
// ديسك دايم، فأي ملف .db أو ملف PDF محفوظ على الفايل سيستم بيتمسح
// أو مينفعش يتكتب. لازم قاعدة بيانات خارجية + تخزين ملف الـ PDF
// جوه القاعدة نفسها (base64 في عمود TEXT) بدل الديسك.
// ─────────────────────────────────────────────────────────────

let _sql = null;
function getSql() {
  if (_sql) return _sql;
  const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL مش متظبط — اربط قاعدة Neon من تاب Storage في Vercel (أو ضيفه في .env.local لو شغّال لوكال)."
    );
  }
  _sql = neon(url);
  return _sql;
}

// بيعمل الجداول أول مرة بس (لكل instance)، ولو فشل بيحاول تاني في الطلب الجاي.
let _schemaPromise = null;
function ensureSchema() {
  if (!_schemaPromise) {
    _schemaPromise = (async () => {
      const sql = getSql();

      await sql`
        CREATE TABLE IF NOT EXISTS otp_codes (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at BIGINT NOT NULL,
          used INTEGER NOT NULL DEFAULT 0,
          created_at BIGINT NOT NULL
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS registrations (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          title_ar TEXT,
          title_en TEXT,
          course_title TEXT,
          required_hours INTEGER,
          leader_name TEXT,
          leader_email TEXT,
          leader_phone TEXT,
          goal TEXT,
          ai_link TEXT,
          community_service TEXT,
          abstract TEXT,
          keywords TEXT,
          supervisors TEXT,
          yn TEXT,
          team TEXT,
          schedule TEXT,
          software_tools TEXT,
          hardware TEXT,
          budget TEXT,
          sponsors TEXT,
          pdf_base64 TEXT,
          created_at BIGINT NOT NULL
        )
      `;

      // Migration: لو الجدول كان موجود قبل ما عمود الـ PDF يتضاف
      await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS pdf_base64 TEXT`;
    })().catch((err) => {
      _schemaPromise = null;
      throw err;
    });
  }
  return _schemaPromise;
}

async function db() {
  await ensureSchema();
  return getSql();
}

/* ---------------- OTP ---------------- */

export async function saveOtp(email, code, ttlMinutes = 10) {
  const sql = await db();
  const now = Date.now();
  const expiresAt = now + ttlMinutes * 60 * 1000;

  // تنضيف الأكواد المنتهية القديمة عشان الجدول ما يكبرش
  await sql`DELETE FROM otp_codes WHERE expires_at < ${now - 24 * 60 * 60 * 1000}`;

  await sql`
    INSERT INTO otp_codes (email, code, expires_at, created_at)
    VALUES (${email}, ${code}, ${expiresAt}, ${now})
  `;
}

// بيتحقق من الكود وبيعلّمه "مستخدم" (استخدام مرة واحدة). Returns { ok, reason }.
export async function verifyOtp(email, code) {
  const sql = await db();

  const rows = await sql`
    SELECT id, expires_at FROM otp_codes
    WHERE email = ${email} AND code = ${code} AND used = 0
    ORDER BY id DESC LIMIT 1
  `;
  const row = rows[0];

  if (!row) return { ok: false, reason: "الكود غلط." };
  if (Number(row.expires_at) < Date.now()) {
    return { ok: false, reason: "الكود منتهي — اطلب كود جديد." };
  }

  // WHERE used = 0 بيضمن إن الكود يتستخدم مرة واحدة حتى لو جه طلبين مع بعض
  const updated = await sql`
    UPDATE otp_codes SET used = 1 WHERE id = ${row.id} AND used = 0 RETURNING id
  `;
  if (updated.length === 0) return { ok: false, reason: "الكود غلط." };

  return { ok: true };
}

/* ---------------- Registrations ---------------- */

// بيحفظ صف التسجيل + ملف الـ PDF نفسه (base64) في نفس الصف — عشان
// لوحة الأدمن تقدر تنزّل نفس الملف اللي الطالب ولّده، من غير ما
// نعتمد على ديسك (مش موجود أصلًا على Vercel).
export async function saveRegistration(email, data, pdfBase64) {
  const sql = await db();

  const rows = await sql`
    INSERT INTO registrations (
      email, title_ar, title_en, course_title, required_hours,
      leader_name, leader_email, leader_phone, goal, ai_link, community_service,
      abstract, keywords, supervisors, yn, team, schedule, software_tools,
      hardware, budget, sponsors, pdf_base64, created_at
    ) VALUES (
      ${email},
      ${data.titleAr || ""},
      ${data.titleEn || ""},
      ${data.courseTitle || ""},
      ${data.requiredHours || null},
      ${data.leaderName || ""},
      ${data.leaderEmail || ""},
      ${data.leaderPhone || ""},
      ${data.goal || ""},
      ${data.aiLink || ""},
      ${data.communityService || ""},
      ${data.abstract || ""},
      ${JSON.stringify(data.keywords || [])},
      ${JSON.stringify(data.supervisors || [])},
      ${JSON.stringify(data.yn || [])},
      ${JSON.stringify(data.team || [])},
      ${JSON.stringify(data.schedule || [])},
      ${JSON.stringify(data.sw || {})},
      ${data.hardware || ""},
      ${JSON.stringify(data.budget || [])},
      ${JSON.stringify(data.sponsors || [])},
      ${pdfBase64 || null},
      ${Date.now()}
    )
    RETURNING id
  `;
  return rows[0]?.id;
}

function safeParse(str, fallback) {
  try {
    return JSON.parse(str || "");
  } catch {
    return fallback;
  }
}

// بيرجّع كل التسجيلات لكن من غير عمود الـ PDF نفسه (عشان الرد يفضل
// خفيف) — بس بيقول هل فيه PDF محفوظ ولا لأ (has_pdf) عشان الفرونت
// يظهر زرار التحميل بس لو فعلًا موجود.
export async function listRegistrations() {
  const sql = await db();
  const rows = await sql`
    SELECT
      id, email, title_ar, title_en, course_title, required_hours,
      leader_name, leader_email, leader_phone, goal, ai_link, community_service,
      abstract, keywords, supervisors, yn, team, schedule, software_tools,
      hardware, budget, sponsors, created_at,
      (pdf_base64 IS NOT NULL) AS has_pdf
    FROM registrations
    ORDER BY created_at DESC
  `;

  return rows.map((r) => ({
    ...r,
    id: Number(r.id),
    created_at: Number(r.created_at),
    keywords: safeParse(r.keywords, []),
    supervisors: safeParse(r.supervisors, []),
    yn: safeParse(r.yn, []),
    team: safeParse(r.team, []),
    schedule: safeParse(r.schedule, []),
    software_tools: safeParse(r.software_tools, {}),
    budget: safeParse(r.budget, []),
    sponsors: safeParse(r.sponsors, []),
  }));
}

// بيرجّع { base64, titleEn, titleAr } لتسجيل معيّن، أو null لو مفيش PDF محفوظ.
export async function getRegistrationPdf(id) {
  const sql = await db();
  const rows = await sql`
    SELECT pdf_base64, title_en, title_ar
    FROM registrations WHERE id = ${Number(id)}
  `;
  const row = rows[0];
  if (!row || !row.pdf_base64) return null;
  return { base64: row.pdf_base64, titleEn: row.title_en, titleAr: row.title_ar };
}

// حذف تسجيل واحد أو أكتر — بيرجّع عدد الصفوف اللي اتمسحت فعلًا
export async function deleteRegistrations(ids) {
  const clean = [...new Set((ids || []).map(Number))].filter(
    (n) => Number.isInteger(n) && n > 0
  );
  if (clean.length === 0) return 0;

  const sql = await db();
  const rows = await sql.query(
    "DELETE FROM registrations WHERE id = ANY($1::int[]) RETURNING id",
    [clean]
  );
  return rows.length;
}

// حذف كل التسجيلات
export async function deleteAllRegistrations() {
  const sql = await db();
  const rows = await sql`DELETE FROM registrations RETURNING id`;
  return rows.length;
}
