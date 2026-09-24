import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";

/*
|--------------------------------------------------------------------------
| Neon Database
|--------------------------------------------------------------------------
*/

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn(
    "[db] DATABASE_URL is not configured. Database operations will fail."
  );
}

const sql = neon(DATABASE_URL || "");

/*
|--------------------------------------------------------------------------
| Database Initialization
|--------------------------------------------------------------------------
*/

let databaseInitialized = false;
let databaseInitializationPromise = null;

async function ensureDatabase() {
  if (databaseInitialized) {
    return;
  }

  if (!databaseInitializationPromise) {
    databaseInitializationPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS otp_codes (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at BIGINT NOT NULL,
          used BOOLEAN NOT NULL DEFAULT FALSE,
          created_at BIGINT NOT NULL
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_otp_email
        ON otp_codes(email)
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS registrations (
          id BIGSERIAL PRIMARY KEY,

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

          pdf_path TEXT,

          created_at BIGINT NOT NULL
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_registrations_created_at
        ON registrations(created_at DESC)
      `;

      databaseInitialized = true;
    })().catch((error) => {
      databaseInitializationPromise = null;
      throw error;
    });
  }

  await databaseInitializationPromise;
}

/*
|--------------------------------------------------------------------------
| Safe JSON
|--------------------------------------------------------------------------
*/

function safeJsonParse(value, fallback) {
  try {
    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/*
|--------------------------------------------------------------------------
| OTP
|--------------------------------------------------------------------------
*/

export async function saveOtp(email, code, ttlMinutes = 10) {
  await ensureDatabase();

  const now = Date.now();
  const expiresAt = now + ttlMinutes * 60 * 1000;

  // Remove old OTPs for the same email.
  await sql`
    DELETE FROM otp_codes
    WHERE email = ${email}
  `;

  await sql`
    INSERT INTO otp_codes (
      email,
      code,
      expires_at,
      used,
      created_at
    )
    VALUES (
      ${email},
      ${code},
      ${expiresAt},
      FALSE,
      ${now}
    )
  `;

  return true;
}

/*
|--------------------------------------------------------------------------
| Verify OTP
|--------------------------------------------------------------------------
*/

export async function verifyOtp(email, code) {
  await ensureDatabase();

  const rows = await sql`
    SELECT
      id,
      email,
      code,
      expires_at,
      used,
      created_at
    FROM otp_codes
    WHERE email = ${email}
      AND code = ${code}
      AND used = FALSE
    ORDER BY id DESC
    LIMIT 1
  `;

  const row = rows[0];

  if (!row) {
    return {
      ok: false,
      reason: "الكود غلط.",
    };
  }

  if (Number(row.expires_at) < Date.now()) {
    return {
      ok: false,
      reason: "الكود منتهي — اطلب كود جديد.",
    };
  }

  await sql`
    UPDATE otp_codes
    SET used = TRUE
    WHERE id = ${row.id}
  `;

  return {
    ok: true,
  };
}

/*
|--------------------------------------------------------------------------
| Save Registration
|--------------------------------------------------------------------------
|
| Database:
|   Neon PostgreSQL
|
| PDF:
|   Vercel Blob
|
*/

export async function saveRegistration(email, data, pdfBase64) {
  await ensureDatabase();

  const now = Date.now();

  /*
  |--------------------------------------------------------------------------
  | 1. Insert registration first
  |--------------------------------------------------------------------------
  */

  const inserted = await sql`
    INSERT INTO registrations (
      email,

      title_ar,
      title_en,
      course_title,
      required_hours,

      leader_name,
      leader_email,
      leader_phone,

      goal,
      ai_link,
      community_service,
      abstract,

      keywords,
      supervisors,
      yn,
      team,
      schedule,
      software_tools,

      hardware,
      budget,
      sponsors,

      pdf_path,
      created_at
    )
    VALUES (
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

      ${null},
      ${now}
    )
    RETURNING id
  `;

  const id = inserted[0]?.id;

  if (!id) {
    throw new Error("Failed to create registration record.");
  }

  /*
  |--------------------------------------------------------------------------
  | 2. Upload PDF to Vercel Blob
  |--------------------------------------------------------------------------
  */

  let pdfPath = null;

  if (pdfBase64) {
    const prefix = "data:application/pdf;base64,";

    if (!String(pdfBase64).startsWith(prefix)) {
      throw new Error("Invalid PDF data.");
    }

    const base64Data = String(pdfBase64).slice(prefix.length);

    const buffer = Buffer.from(base64Data, "base64");

    const pathname = `registrations/${id}.pdf`;

    const blob = await put(pathname, buffer, {
      access: "private",
      contentType: "application/pdf",
      addRandomSuffix: false,
    });

    pdfPath = blob.pathname;

    /*
    |--------------------------------------------------------------------------
    | 3. Save Blob pathname in database
    |--------------------------------------------------------------------------
    */

    await sql`
      UPDATE registrations
      SET pdf_path = ${pdfPath}
      WHERE id = ${id}
    `;
  }

  return {
    id: String(id),
    pdfPath,
  };
}

/*
|--------------------------------------------------------------------------
| List Registrations
|--------------------------------------------------------------------------
*/

export async function listRegistrations() {
  await ensureDatabase();

  const rows = await sql`
    SELECT *
    FROM registrations
    ORDER BY created_at DESC
  `;

  return rows.map((row) => ({
    id: String(row.id),

    email: row.email,

    title_ar: row.title_ar,
    title_en: row.title_en,
    course_title: row.course_title,
    required_hours: row.required_hours,

    leader_name: row.leader_name,
    leader_email: row.leader_email,
    leader_phone: row.leader_phone,

    goal: row.goal,
    ai_link: row.ai_link,
    community_service: row.community_service,
    abstract: row.abstract,

    keywords: safeJsonParse(row.keywords, []),
    supervisors: safeJsonParse(row.supervisors, []),
    yn: safeJsonParse(row.yn, []),
    team: safeJsonParse(row.team, []),
    schedule: safeJsonParse(row.schedule, []),
    software_tools: safeJsonParse(row.software_tools, {}),

    hardware: row.hardware,
    budget: safeJsonParse(row.budget, []),
    sponsors: safeJsonParse(row.sponsors, []),

    pdf_path: row.pdf_path,

    created_at: row.created_at,
  }));
}

/*
|--------------------------------------------------------------------------
| Get Registration PDF Path
|--------------------------------------------------------------------------
*/

export async function getRegistrationPdfPath(id) {
  await ensureDatabase();

  const rows = await sql`
    SELECT pdf_path
    FROM registrations
    WHERE id = ${id}
    LIMIT 1
  `;

  const row = rows[0];

  if (!row || !row.pdf_path) {
    return null;
  }

  return row.pdf_path;
}
