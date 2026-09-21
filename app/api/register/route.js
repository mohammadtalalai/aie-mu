import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../lib/session";
import { saveRegistration } from "../../lib/db";

// This runs on the SERVER (never in the browser), so it's safe to use
// SMTP credentials here — they're read from environment variables and
// never sent to the client. See REGISTRATION_README.md for setup.
export async function POST(request) {
  try {
    // ── Real security check happens HERE, not in the browser ──
    // The client can be tricked or bypassed, but it can't forge a valid
    // signed cookie — that can only exist if /api/auth/verify-otp issued
    // it after a correct OTP for this exact email.
    const cookieStore = await cookies();
    const token = cookieStore.get("reg_session")?.value;
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return Response.json(
        { ok: false, error: "لازم تتحقق من الإيميل الجامعي الأول قبل التسجيل." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { data, pdfBase64 } = body || {};

    if (!data || !pdfBase64) {
      return Response.json(
        { ok: false, error: "Missing form data or PDF." },
        { status: 400 }
      );
    }

    // Persist the full submission — this is the permanent record, kept
    // regardless of whether the email to the admin succeeds below. The
    // actual PDF file is saved to disk too, so the admin can download it
    // later from /admin/registrations without depending on the email.
    saveRegistration(session.email, data, pdfBase64);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

    // .trim() guards against a very common copy-paste mistake: an extra
    // space or invisible character at the start/end of a value in
    // .env.local, which otherwise causes a confusing "Invalid login" error
    // that looks like the password itself is wrong.
    const host = SMTP_HOST?.trim();
    const user = SMTP_USER?.trim();
    const pass = SMTP_PASS?.trim();
    const adminEmail = ADMIN_EMAIL?.trim();
    const port = Number(SMTP_PORT?.trim()) || 587;

    if (!host || !user || !pass || !adminEmail) {
      console.error(
        "[register] Missing SMTP_HOST / SMTP_USER / SMTP_PASS / ADMIN_EMAIL env vars — email not sent."
      );
      return Response.json(
        {
          ok: false,
          error:
            "الإيميل مش متظبط على السيرفر لسه — تأكد إن ملف .env.local فيه SMTP_HOST و SMTP_USER و SMTP_PASS و ADMIN_EMAIL، وإنك عملت restart للسيرفر بعد ما ضفتهم.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465, false for 587/25
      auth: { user, pass },
    });

    // Checks the SMTP connection + login BEFORE trying to send, so a wrong
    // App Password or wrong host/port shows a clear, specific error instead
    // of a generic "Failed to send email."
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.error("[register] SMTP verify failed:", verifyErr);
      return Response.json(
        {
          ok: false,
          error: `مش قادر يدخل على حساب الإيميل: ${verifyErr.message}. راجع إن SMTP_PASS هو الـ App Password الصحيح (16 حرف بدون مسافات)، وإن SMTP_HOST/SMTP_PORT مظبوطين.`,
        },
        { status: 500 }
      );
    }

    // pdfBase64 arrives as a data URI: "data:application/pdf;base64,XXXXX"
    const base64Data = String(pdfBase64).split(",").pop();

    const esc = (s) =>
      String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const teamListHtml =
      (data.team || [])
        .filter((m) => m.name)
        .map(
          (m) =>
            `<li>${esc(m.name)} — ${esc(m.hours) || "?"} ساعة معتمدة — GPA ${esc(m.gpa) || "?"}</li>`
        )
        .join("") || "<li>لم يتم إدخال أعضاء بعد</li>";

    const supervisorsHtml =
      (data.supervisors || [])
        .filter(Boolean)
        .map((s) => `<li>${esc(s)}</li>`)
        .join("") || "<li>—</li>";

    const html = `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.9;color:#111">
        <h2 style="color:#06265b;margin-bottom:4px;">📥 تسجيل مشروع تخرج جديد</h2>
        <p style="color:#64748b;margin-top:0;">وصل الآن من صفحة Project Registration</p>

        <table style="border-collapse:collapse;width:100%;max-width:560px;margin:16px 0;">
          <tr><td style="padding:6px 0;font-weight:bold;width:160px;">المشروع المختار</td><td>${esc(data.courseTitle)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">العنوان (عربي)</td><td>${esc(data.titleAr)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Project Title</td><td>${esc(data.titleEn)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">قائد الفريق</td><td>${esc(data.leaderName)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">إيميل القائد</td><td>${esc(data.leaderEmail)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">موبايل القائد</td><td>${esc(data.leaderPhone)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">الكلمات المفتاحية</td><td>${(data.keywords || []).map(esc).join("، ")}</td></tr>
        </table>

        <p style="font-weight:bold;margin-bottom:4px;">فريق الإشراف:</p>
        <ul style="margin-top:0;">${supervisorsHtml}</ul>

        <p style="font-weight:bold;margin-bottom:4px;">فريق المشروع:</p>
        <ul style="margin-top:0;">${teamListHtml}</ul>

        <p style="font-weight:bold;margin-bottom:4px;">الهدف من المشروع:</p>
        <p style="margin-top:0;">${esc(data.goal)}</p>

        <p style="font-weight:bold;margin-bottom:4px;">ربط المشروع بالتخصص:</p>
        <p style="margin-top:0;">${esc(data.aiLink)}</p>

        <p style="font-weight:bold;margin-bottom:4px;">ربط المشروع بالخدمة المجتمعية:</p>
        <p style="margin-top:0;">${esc(data.communityService)}</p>

        <p style="margin-top:18px;color:#64748b;">النموذج الكامل معبّى بكل التفاصيل مرفق كملف PDF مع الإيميل ده.</p>
      </div>
    `;

    const safeName =
      (data.titleEn || "project")
        .replace(/[^a-z0-9\-_ ]/gi, "")
        .trim()
        .replace(/\s+/g, "_") || "project";

    await transporter.sendMail({
      from: `"تسجيل مشاريع AI Engineering" <${user}>`,
      to: adminEmail,
      subject: `تسجيل مشروع جديد: ${data.titleEn || data.titleAr || "بدون عنوان"}`,
      html,
      attachments: [
        {
          filename: `${safeName}_Registration.pdf`,
          content: base64Data,
          encoding: "base64",
        },
      ],
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[register] Failed to send registration email:", err);
    // Surface the REAL underlying error (e.g. "Invalid login", "ENOTFOUND",
    // wrong port, etc.) directly in the response — this is what actually
    // shows up in the toast on screen, so there's no need to go dig through
    // server terminal logs to diagnose a setup problem.
    return Response.json(
      { ok: false, error: err?.message || "Failed to send email." },
      { status: 500 }
    );
  }
}
