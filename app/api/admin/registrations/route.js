import { listRegistrations } from "../../../lib/db";

export async function GET(request) {
  const auth = request.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    return Response.json(
      { ok: false, error: "ADMIN_PASSWORD مش متظبط على السيرفر." },
      { status: 500 }
    );
  }

  if (auth !== expected) {
    return Response.json({ ok: false, error: "الباسورد غلط." }, { status: 401 });
  }

  try {
    const registrations = listRegistrations();
    return Response.json({ ok: true, registrations });
  } catch (err) {
    console.error("[admin/registrations] failed:", err);
    return Response.json({ ok: false, error: "حصل خطأ في قراءة القاعدة." }, { status: 500 });
  }
}
