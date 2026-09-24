"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminRegistrationsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [openId, setOpenId] = useState(null);

  // الحذف
  const [selected, setSelected] = useState(() => new Set());
  const [confirm, setConfirm] = useState(null); // { kind: "ids" | "all", ids?, message }
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null); // { text, err }

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      load(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flash(text, err = false) {
    setNotice({ text, err });
    setTimeout(() => setNotice(null), 4000);
  }

  async function load(pw) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/registrations", {
        headers: { "x-admin-password": pw },
        cache: "no-store",
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "فشل تسجيل الدخول");
      }
      setRows(body.registrations);
      // نشيل أي اختيار لصفوف مبقتش موجودة
      setSelected((prev) => {
        const alive = new Set(body.registrations.map((r) => r.id));
        return new Set([...prev].filter((id) => alive.has(id)));
      });
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

  function logout() {
    sessionStorage.removeItem("admin_pw");
    setAuthed(false);
    setPassword("");
    setRows([]);
    setSelected(new Set());
  }

  /* ---------- الاختيار ---------- */
  const allSelected = useMemo(
    () => rows.length > 0 && rows.every((r) => selected.has(r.id)),
    [rows, selected]
  );

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  /* ---------- الحذف ---------- */
  function askDeleteOne(r) {
    setConfirmText("");
    setConfirm({
      kind: "ids",
      ids: [r.id],
      message: `هتحذف تسجيل "${r.title_en || r.title_ar || "بدون عنوان"}" نهائيًا. مينفعش تتراجع بعد كده.`,
    });
  }

  function askDeleteSelected() {
    if (selected.size === 0) return;
    setConfirmText("");
    setConfirm({
      kind: "ids",
      ids: [...selected],
      message: `هتحذف ${selected.size} تسجيل نهائيًا. مينفعش تتراجع بعد كده.`,
    });
  }

  function askDeleteAll() {
    if (rows.length === 0) return;
    setConfirmText("");
    setConfirm({
      kind: "all",
      message: `هتحذف كل التسجيلات (${rows.length}) من قاعدة البيانات نهائيًا. اكتب كلمة  حذف  للتأكيد.`,
    });
  }

  async function runDelete() {
    if (!confirm) return;
    if (confirm.kind === "all" && confirmText.trim() !== "حذف") return;

    setDeleting(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(confirm.kind === "all" ? { all: true } : { ids: confirm.ids }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || "فشل الحذف");

      flash(`✓ اتحذف ${body.deleted} تسجيل`);
      setConfirm(null);
      setOpenId(null);
      await load(password);
    } catch (err) {
      flash(err.message, true);
    } finally {
      setDeleting(false);
    }
  }

  /* ---------- شاشة الدخول ---------- */
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

  /* ---------- اللوحة ---------- */
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => load(password)}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-bold text-[var(--fg-muted)] hover:text-[var(--fg)]"
            >
              ↻ تحديث
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-bold text-[var(--fg-muted)] hover:text-[var(--fg)]"
            >
              خروج
            </button>
          </div>
        </div>

        {/* شريط أدوات الحذف */}
        {rows.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--fg)]">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 accent-[var(--navy)]"
              />
              تحديد الكل
              {selected.size > 0 && (
                <span className="text-xs font-normal text-[var(--fg-muted)]">
                  ({selected.size} محدد)
                </span>
              )}
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={askDeleteSelected}
                disabled={selected.size === 0}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                🗑 حذف المحدد
              </button>
              <button
                type="button"
                onClick={askDeleteAll}
                className="rounded-full border border-red-500/50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-500/10"
              >
                حذف الكل
              </button>
            </div>
          </div>
        )}

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--fg-subtle)]">
            لسه مفيش أي تسجيلات.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const open = openId === r.id;
              const checked = selected.has(r.id);
              return (
                <div
                  key={r.id}
                  className={`overflow-hidden rounded-2xl border bg-[var(--surface)] ${
                    checked ? "border-red-500/60" : "border-[var(--border)]"
                  }`}
                >
                  <div className="flex items-stretch">
                    <label className="flex cursor-pointer items-center px-4">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(r.id)}
                        className="h-4 w-4 accent-[var(--navy)]"
                        aria-label="تحديد التسجيل"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : r.id)}
                      className="flex flex-1 flex-wrap items-center justify-between gap-3 py-5 pl-2 text-right"
                    >
                      <div>
                        <p className="font-bold text-[var(--fg)]">
                          {r.title_en || "(بدون عنوان)"}{" "}
                          <span className="text-[var(--fg-muted)]">— {r.title_ar}</span>
                        </p>
                        <p className="mt-1 text-xs text-[var(--fg-subtle)]">
                          {r.email} · {r.course_title} ·{" "}
                          {new Date(r.created_at).toLocaleString("ar-EG")}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[var(--gold)]">
                        {open ? "إخفاء التفاصيل ▲" : "عرض التفاصيل ▼"}
                      </span>
                    </button>

                    {r.has_pdf && (
                      <a
                        href={`/api/admin/registrations/${r.id}/pdf`}
                        onClick={(e) => {
                          // بنبعت الباسورد كـ header، فمينفعش نعتمد على الـ <a href>
                          // العادي (اللي مبيبعتش headers) — بنعمل fetch يدوي ونفتح
                          // الملف من blob بدل كده.
                          e.preventDefault();
                          fetch(`/api/admin/registrations/${r.id}/pdf`, {
                            headers: { "x-admin-password": password },
                          })
                            .then(async (res) => {
                              if (!res.ok) throw new Error("فشل تحميل الملف");
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${r.title_en || r.title_ar || "registration"}_${r.id}.pdf`;
                              a.click();
                              URL.revokeObjectURL(url);
                            })
                            .catch(() => flash("فشل تحميل الملف", true));
                        }}
                        title="تحميل ملف الـ PDF"
                        className="flex items-center px-3 text-lg text-[var(--gold)] transition hover:bg-[var(--gold)]/10"
                      >
                        📄
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => askDeleteOne(r)}
                      title="حذف التسجيل"
                      className="px-4 text-lg text-red-500 transition hover:bg-red-500/10"
                    >
                      🗑
                    </button>
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

      {/* رسالة نجاح/خطأ */}
      {notice && (
        <div
          onClick={() => setNotice(null)}
          className={`fixed bottom-6 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 cursor-pointer rounded-xl px-6 py-3.5 text-center text-sm font-bold text-white shadow-2xl ${
            notice.err ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      {confirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6"
          onClick={() => !deleting && setConfirm(null)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="mb-3 flex items-center gap-2 text-red-600">
              <span className="text-xl">⚠️</span>
              <h3 className="text-base font-extrabold">تأكيد الحذف</h3>
            </div>
            <p className="mb-4 text-sm leading-7 text-[var(--fg)]">{confirm.message}</p>

            {confirm.kind === "all" && (
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="حذف"
                autoFocus
                className="mb-4 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none focus:border-red-500"
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirm(null)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-bold text-[var(--fg-muted)] transition hover:bg-[var(--border)] disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={runDelete}
                disabled={deleting || (confirm.kind === "all" && confirmText.trim() !== "حذف")}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? "جارِ الحذف..." : "أيوه، احذف"}
              </button>
            </div>
          </div>
        </div>
      )}
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
