"use client";

import { useEffect, useState } from "react";

export default function AdminRegistrationsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      load(saved);
    }
  }, []);

  async function load(pw) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/registrations", {
        headers: { "x-admin-password": pw },
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "فشل تسجيل الدخول");
      }
      setRows(body.registrations);
      setAuthed(true);
      sessionStorage.setItem("admin_pw", pw);
    } catch (err) {
      setError(err.message);
      setAuthed(false);
      sessionStorage.removeItem("admin_pw");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    load(password);
  }

  // Fetches the exact PDF the student generated (stored server-side at
  // registration time) and saves it — same technique the registration page
  // itself uses, just pulling the file from our own API instead of jsPDF.
  async function downloadPdf(id, titleEn) {
    setDownloadError("");
    setDownloadingId(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}/pdf`, {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "الملف مش موجود.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(titleEn || "project").replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "_") || "project"}_Registration.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setDownloadingId(null);
    }
  }

  if (!authed) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 transition-colors duration-300">
        <form
          onSubmit={handleSubmit}
          dir="rtl"
          className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm"
        >
          <h1 className="mb-1 text-xl font-black text-[var(--fg)]">لوحة الأدمن</h1>
          <p className="mb-6 text-sm text-[var(--fg-muted)]">
            المشاريع المسجّلة — AI Engineering
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة السر"
            dir="ltr"
            autoFocus
            className="mb-4 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--fg)] outline-none focus:border-[var(--gold)]"
          />

          {error && <p className="mb-4 text-sm font-semibold text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--navy)] py-3 text-sm font-bold text-white transition hover:bg-[var(--navy-light)] disabled:opacity-60"
          >
            {loading ? "جارِ الدخول..." : "دخول"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--bg)] px-6 pb-20 pt-28 transition-colors duration-300 md:px-10">
      <div className="mx-auto max-w-6xl" dir="rtl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[var(--fg)]">
              المشاريع المسجّلة ({rows.length})
            </h1>
            <p className="text-sm text-[var(--fg-muted)]">من قاعدة بيانات الموقع مباشرة</p>
          </div>
          <button
            type="button"
            onClick={() => load(password)}
            className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-bold text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            ↻ تحديث
          </button>
        </div>

        {downloadError && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm font-semibold text-red-600">
            {downloadError}
          </p>
        )}

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--fg-subtle)]">
            لسه مفيش أي تسجيلات.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const open = openId === r.id;
              const downloading = downloadingId === r.id;
              return (
                <div
                  key={r.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : r.id)}
                      className="min-w-0 flex-1 text-right"
                    >
                      <p className="font-bold text-[var(--fg)]">
                        {r.title_en || "(بدون عنوان)"}{" "}
                        <span className="text-[var(--fg-muted)]">— {r.title_ar}</span>
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="rounded-full bg-[var(--gold-soft)] px-2.5 py-1 font-bold text-[var(--gold)]">
                          ✉ {r.email}
                        </span>
                        <span className="text-[var(--fg-subtle)]">
                          · {r.course_title} · {new Date(r.created_at).toLocaleString("ar-EG")}
                        </span>
                      </p>
                    </button>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadPdf(r.id, r.title_en)}
                        disabled={downloading}
                        className="flex items-center gap-1.5 rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--navy-light)] disabled:opacity-60"
                      >
                        {downloading ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            جارِ التحميل...
                          </>
                        ) : (
                          <>⬇ تحميل PDF</>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : r.id)}
                        className="text-xs font-bold text-[var(--gold)]"
                      >
                        {open ? "إخفاء ▲" : "تفاصيل ▼"}
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="grid gap-4 border-t border-[var(--border)] p-5 text-sm sm:grid-cols-2">
                      <Field label="قائد الفريق" value={`${r.leader_name} — ${r.leader_email} — ${r.leader_phone}`} />
                      <Field label="فريق الإشراف" value={(r.supervisors || []).filter(Boolean).join("، ") || "—"} />
                      <Field
                        label="فريق المشروع"
                        value={
                          (r.team || [])
                            .filter((m) => m.name)
                            .map((m) => `${m.name} (${m.hours} ساعة, GPA ${m.gpa})`)
                            .join("، ") || "—"
                        }
                      />
                      <Field label="الكلمات المفتاحية" value={(r.keywords || []).join("، ") || "—"} />
                      <Field label="الهدف من المشروع" value={r.goal} full />
                      <Field label="ربط بالتخصص" value={r.ai_link} full />
                      <Field label="ربط بالخدمة المجتمعية" value={r.community_service} full />
                      <Field label="Abstract" value={r.abstract} full ltr />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, full, ltr }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--gold)]">
        {label}
      </p>
      <p
        dir={ltr ? "ltr" : "rtl"}
        className="whitespace-pre-line rounded-lg bg-[var(--surface-soft)] p-3 text-[var(--fg-muted)]"
      >
        {value || "—"}
      </p>
    </div>
  );
}
