import { verifyOtp } from "../../../lib/db";
import { createSessionToken } from "../../../lib/session";

export async function POST(request) {
  try {
    const { email, code } = await request.json();
    const clean = String(email || "").trim().toLowerCase();
    const cleanCode = String(code || "").trim();

    if (!clean || !cleanCode) {
      return Response.json({ ok: false, error: "اكتب الإيميل والكود." }, { status: 400 });
    }

    const result = verifyOtp(clean, cleanCode);
    if (!result.ok) {
      return Response.json({ ok: false, error: result.reason }, { status: 400 });
    }

    // 60 minutes is plenty of time to fill the full registration form.
    const token = createSessionToken(clean, 60);

    const res = Response.json({ ok: true, email: clean });
    res.headers.append(
      "Set-Cookie",
      `reg_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60}`
    );
    return res;
  } catch (err) {
    console.error("[verify-otp] failed:", err);
    return Response.json(
      { ok: false, error: err?.message || "حصل خطأ أثناء التحقق." },
      { status: 500 }
    );
  }
}
