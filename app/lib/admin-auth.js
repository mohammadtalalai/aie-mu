import crypto from "crypto";

// بيتحقق من باسورد الأدمن (اللي جاي في header اسمه x-admin-password)
// بمقارنة آمنة ضد timing attacks. بيرجّع { ok } أو { ok:false, status, error }.
export function checkAdmin(request) {
  const expected = (process.env.ADMIN_PASSWORD || "").trim();

  if (!expected) {
    return { ok: false, status: 500, error: "ADMIN_PASSWORD مش متظبط على السيرفر." };
  }

  const given = (request.headers.get("x-admin-password") || "").trim();

  // نعمل hash للاتنين الأول عشان الطولين يبقوا متساويين (timingSafeEqual بيشترط كده)
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();

  if (!crypto.timingSafeEqual(a, b)) {
    return { ok: false, status: 401, error: "الباسورد غلط." };
  }
  return { ok: true };
}
