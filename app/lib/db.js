import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";

const sql = neon(process.env.DATABASE_URL);

let initialized = false;

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

async function ensureDatabase() {
  if (initialized) {
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing.");
  }

  /* =========================
     OTP TABLE
  ========================= */

  await sql`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
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

  /* =========================
     REGISTRATIONS TABLE
  ========================= */

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

      pdf_filename TEXT,
      pdf_url TEXT,

      created_at BIGINT NOT NULL
    )
  `;

  initialized = true;
}

/* =========================================================
   OTP
========================================================= */

export async function saveOtp(
  email,
  code,
  ttlMinutes = 10
) {
  await ensureDatabase();

  const now = Date.now();

  const expiresAt =
    now + ttlMinutes * 60 * 1000;

  /*
    Delete old codes for this email.
    This makes sure only the latest OTP is active.
  */

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

/* =========================================================
   VERIFY OTP
========================================================= */

export async function verifyOtp(
  email,
  code
) {
  await ensureDatabase();

  const rows = await sql`
    SELECT
      id,
      email,
      code,
      expires_at,
      used
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

/* =========================================================
   SAVE REGISTRATION
========================================================= */

export async function saveRegistration(
  email,
  data,
  pdfBase64
) {
  await ensureDatabase();

  const now = Date.now();

  /* =====================================================
     1. Save registration information
  ===================================================== */

  const result = await sql`
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

      pdf_filename,
      pdf_url,

      created_at
    )
    VALUES (
      ${email},

      ${data.titleAr || ""},
      ${data.titleEn || ""},
      ${data.courseTitle || ""},

      ${
        data.requiredHours !== undefined &&
        data.requiredHours !== null &&
        data.requiredHours !== ""
          ? Number(data.requiredHours)
          : null
      },

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

      NULL,
      NULL,

      ${now}
    )

    RETURNING id
  `;

  const id = result[0]?.id;

  if (!id) {
    throw new Error(
      "Registration was inserted but no ID was returned."
    );
  }

  /* =====================================================
     2. Upload PDF to Vercel Blob
  ===================================================== */

  if (pdfBase64) {
    try {
      const prefix =
        "data:application/pdf;base64,";

      let base64Data = pdfBase64;

      if (pdfBase64.startsWith(prefix)) {
        base64Data =
          pdfBase64.slice(prefix.length);
      }

      const pdfBuffer =
        Buffer.from(base64Data, "base64");

      const filename =
        `registrations/${id}.pdf`;

      const blob = await put(
        filename,
        pdfBuffer,
        {
          access: "private",
          contentType: "application/pdf",
          addRandomSuffix: false,
        }
      );

      await sql`
        UPDATE registrations
        SET
          pdf_filename = ${filename},
          pdf_url = ${blob.url}
        WHERE id = ${id}
      `;
    } catch (error) {
      /*
        Registration data is already saved.
        We don't delete it if PDF upload fails.
      */

      console.error(
        "[db] PDF upload failed:",
        error
      );
    }
  }

  return {
    id,
  };
}

/* =========================================================
   LIST REGISTRATIONS
========================================================= */

export async function listRegistrations() {
  await ensureDatabase();

  const rows = await sql`
    SELECT *
    FROM registrations
    ORDER BY created_at DESC
  `;

  return rows.map((row) => ({
    ...row,

    keywords: safeJsonParse(
      row.keywords,
      []
    ),

    supervisors: safeJsonParse(
      row.supervisors,
      []
    ),

    yn: safeJsonParse(
      row.yn,
      []
    ),

    team: safeJsonParse(
      row.team,
      []
    ),

    schedule: safeJsonParse(
      row.schedule,
      []
    ),

    software_tools: safeJsonParse(
      row.software_tools,
      {}
    ),

    budget: safeJsonParse(
      row.budget,
      []
    ),

    sponsors: safeJsonParse(
      row.sponsors,
      []
    ),
  }));
}

/* =========================================================
   SAFE JSON PARSER
========================================================= */

function safeJsonParse(
  value,
  fallback
) {
  try {
    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/* =========================================================
   GET PDF PATH
========================================================= */

export async function getRegistrationPdfPath(
  id
) {
  await ensureDatabase();

  const rows = await sql`
    SELECT
      pdf_filename
    FROM registrations
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!rows[0]?.pdf_filename) {
    return null;
  }

  return rows[0].pdf_filename;
}

export default sql;
