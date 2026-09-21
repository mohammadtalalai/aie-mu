import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// One local file holds everything — no external database account needed.
// In production behind a normal Node server (not a serverless/edge
// platform) this file just lives on disk and persists across restarts.
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "registrations.db");
const PDF_DIR = path.join(DATA_DIR, "pdfs");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    keywords TEXT,        -- JSON array
    supervisors TEXT,     -- JSON array
    yn TEXT,               -- JSON array
    team TEXT,              -- JSON array
    schedule TEXT,          -- JSON array
    software_tools TEXT,    -- JSON object
    hardware TEXT,
    budget TEXT,             -- JSON array
    sponsors TEXT,           -- JSON array
    pdf_filename TEXT,       -- filename inside data/pdfs/, added via migration below
    created_at INTEGER NOT NULL
  );
`);

// Migration: older databases created before this feature existed won't
// have the pdf_filename column yet — add it if missing, without touching
// any existing data.
const existingCols = db.prepare(`PRAGMA table_info(registrations)`).all();
if (!existingCols.some((c) => c.name === "pdf_filename")) {
  db.exec(`ALTER TABLE registrations ADD COLUMN pdf_filename TEXT`);
}

/* ---------------- OTP ---------------- */

export function saveOtp(email, code, ttlMinutes = 10) {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  db.prepare(
    `INSERT INTO otp_codes (email, code, expires_at, created_at) VALUES (?, ?, ?, ?)`
  ).run(email, code, expiresAt, Date.now());
}

// Verifies a code and marks it used (one-time use). Returns { ok, reason }.
export function verifyOtp(email, code) {
  const row = db
    .prepare(
      `SELECT * FROM otp_codes WHERE email = ? AND code = ? AND used = 0 ORDER BY id DESC LIMIT 1`
    )
    .get(email, code);

  if (!row) return { ok: false, reason: "الكود غلط." };
  if (row.expires_at < Date.now()) {
    return { ok: false, reason: "الكود منتهي — اطلب كود جديد." };
  }

  db.prepare(`UPDATE otp_codes SET used = 1 WHERE id = ?`).run(row.id);
  return { ok: true };
}

/* ---------------- Registrations ---------------- */

// Saves the registration row AND the actual PDF file (decoded from the
// "data:application/pdf;base64,...." string sent by the client), so the
// admin page can download the exact document the student generated.
export function saveRegistration(email, data, pdfBase64) {
  const info = db
    .prepare(
      `INSERT INTO registrations (
        email, title_ar, title_en, course_title, required_hours,
        leader_name, leader_email, leader_phone, goal, ai_link, community_service,
        abstract, keywords, supervisors, yn, team, schedule, software_tools,
        hardware, budget, sponsors, pdf_filename, created_at
      ) VALUES (?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?,?, ?,?,?,?,?)`
    )
    .run(
      email,
      data.titleAr || "",
      data.titleEn || "",
      data.courseTitle || "",
      data.requiredHours || null,
      data.leaderName || "",
      data.leaderEmail || "",
      data.leaderPhone || "",
      data.goal || "",
      data.aiLink || "",
      data.communityService || "",
      data.abstract || "",
      JSON.stringify(data.keywords || []),
      JSON.stringify(data.supervisors || []),
      JSON.stringify(data.yn || []),
      JSON.stringify(data.team || []),
      JSON.stringify(data.schedule || []),
      JSON.stringify(data.sw || {}),
      data.hardware || "",
      JSON.stringify(data.budget || []),
      JSON.stringify(data.sponsors || []),
      null, // pdf_filename set below once we know the row's id
      Date.now()
    );

  const id = info.lastInsertRowid;

  if (pdfBase64) {
    try {
      const base64Data = String(pdfBase64).split(",").pop();
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `${id}.pdf`;
      fs.writeFileSync(path.join(PDF_DIR, filename), buffer);
      db.prepare(`UPDATE registrations SET pdf_filename = ? WHERE id = ?`).run(filename, id);
    } catch (err) {
      // A PDF write failure shouldn't lose the registration data itself.
      console.error("[db] failed to save PDF file for registration", id, err);
    }
  }

  return id;
}

export function listRegistrations() {
  const rows = db
    .prepare(`SELECT * FROM registrations ORDER BY created_at DESC`)
    .all();

  return rows.map((r) => ({
    ...r,
    keywords: JSON.parse(r.keywords || "[]"),
    supervisors: JSON.parse(r.supervisors || "[]"),
    yn: JSON.parse(r.yn || "[]"),
    team: JSON.parse(r.team || "[]"),
    schedule: JSON.parse(r.schedule || "[]"),
    software_tools: JSON.parse(r.software_tools || "{}"),
    budget: JSON.parse(r.budget || "[]"),
    sponsors: JSON.parse(r.sponsors || "[]"),
  }));
}

// Returns the absolute path to a registration's stored PDF, or null if
// there isn't one (e.g. the write failed at submission time).
export function getRegistrationPdfPath(id) {
  const row = db
    .prepare(`SELECT pdf_filename FROM registrations WHERE id = ?`)
    .get(id);
  if (!row || !row.pdf_filename) return null;
  const fullPath = path.join(PDF_DIR, row.pdf_filename);
  return fs.existsSync(fullPath) ? fullPath : null;
}

export default db;
