import {
  listRegistrations,
  deleteRegistrations,
  deleteAllRegistrations,
} from "../../../lib/db";
import { checkAdmin } from "../../../lib/admin-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/* ---------- GET: عرض كل التسجيلات ---------- */
export async function GET(request) {
  const auth = checkAdmin(request);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const registrations = await listRegistrations();
    return Response.json({ ok: true, registrations });
  } catch (err) {
    console.error("[admin/registrations] GET failed:", err);
    return Response.json(
      { ok: false, error: err?.message || "حصل خطأ في قراءة القاعدة." },
      { status: 500 }
    );
  }
}

/* ---------- DELETE: حذف تسجيل/تسجيلات ----------
   Body:  { "ids": [1, 2, 3] }   ← حذف محدد
      أو  { "all": true }        ← حذف كل التسجيلات
------------------------------------------------ */
export async function DELETE(request) {
  const auth = checkAdmin(request);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => ({}));

    let deleted = 0;
    if (body?.all === true) {
      deleted = await deleteAllRegistrations();
    } else if (Array.isArray(body?.ids) && body.ids.length > 0) {
      deleted = await deleteRegistrations(body.ids);
    } else {
      return Response.json(
        { ok: false, error: "لازم تبعت ids (مصفوفة) أو all: true." },
        { status: 400 }
      );
    }

    return Response.json({ ok: true, deleted });
  } catch (err) {
    console.error("[admin/registrations] DELETE failed:", err);
    return Response.json(
      { ok: false, error: err?.message || "حصل خطأ أثناء الحذف." },
      { status: 500 }
    );
  }
}
