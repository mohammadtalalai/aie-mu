import crypto from "crypto";
import nodemailer from "nodemailer";
import { saveOtp } from "../../../lib/db";

// Change this to your actual university student-email domain.
const ALLOWED_EMAIL_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || "@std.mans.edu.eg").toLowerCase();

export async function POST(request) {
  try {
    const { email } = await request.json();
    const clean = String(email || "").trim().toLowerCase();

    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return Response.json({ ok: false, error: "اكتب إيميل صحيح." }, { status: 400 });
    }

    if (!clean.endsWith(ALLOWED_EMAIL_DOMAIN)) {
      return Response.json(
        {
          ok: false,
          error: `لازم تستخدم الإيميل الجامعي بتاعك (اللي بينتهي بـ ${ALLOWED_EMAIL_DOMAIN}).`,
        },
        { status: 400 }
      );
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    const host = SMTP_HOST?.trim();
    const user = SMTP_USER?.trim();
    const pass = SMTP_PASS?.trim();
    const port = Number(SMTP_PORT?.trim()) || 587;

    if (!host || !user || !pass) {
      console.error("[send-otp] SMTP env vars are missing.");
      return Response.json(
        { ok: false, error: "الإيميل مش متظبط على السيرفر لسه." },
        { status: 500 }
      );
    }

    const code = String(crypto.randomInt(100000, 999999));
    saveOtp(clean, code, 10);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.error("[send-otp] SMTP verify failed:", verifyErr);
      return Response.json(
        { ok: false, error: `مش قادر يبعت إيميلات دلوقتي: ${verifyErr.message}` },
        { status: 500 }
      );
    }

    await transporter.sendMail({
      from: `"تسجيل مشاريع AI Engineering" <${user}>`,
      to: clean,
      subject: "كود التحقق — تسجيل مشروع التخرج",
      html: `
        <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;color:#111;">
          <p>أهلًا،</p>
          <p>كود التحقق بتاعك عشان تكمل تسجيل مشروع التخرج هو:</p>
          <p style="font-size:32px;font-weight:900;letter-spacing:6px;color:#06265b;margin:16px 0;">${code}</p>
          <p style="color:#888;font-size:13px;">الكود صالح لمدة 10 دقايق بس. لو ما طلبتش الكود ده، تجاهل الإيميل.</p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[send-otp] failed:", err);
    return Response.json(
      { ok: false, error: err?.message || "حصل خطأ أثناء إرسال الكود." },
      { status: 500 }
    );
  }
}
