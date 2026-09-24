import crypto from "crypto";
import nodemailer from "nodemailer";
import { saveOtp } from "../../../lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ALLOWED_EMAIL_DOMAIN = (
  process.env.ALLOWED_EMAIL_DOMAIN || "@std.mans.edu.eg"
)
  .trim()
  .toLowerCase();

export async function POST(request) {
  try {
    // =========================
    // 1. Read JSON safely
    // =========================
    let body;

    try {
      body = await request.json();
    } catch (error) {
      console.error("[send-otp] Invalid JSON request:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "بيانات الطلب غير صحيحة.",
        },
        { status: 400 }
      );
    }

    const email = body?.email;

    const clean = String(email || "")
      .trim()
      .toLowerCase();

    // =========================
    // 2. Validate email
    // =========================
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return NextResponse.json(
        {
          ok: false,
          error: "اكتب إيميل صحيح.",
        },
        { status: 400 }
      );
    }

    // =========================
    // 3. Validate university domain
    // =========================
    if (!clean.endsWith(ALLOWED_EMAIL_DOMAIN)) {
      return NextResponse.json(
        {
          ok: false,
          error: `لازم تستخدم الإيميل الجامعي اللي بينتهي بـ ${ALLOWED_EMAIL_DOMAIN}.`,
        },
        { status: 400 }
      );
    }

    // =========================
    // 4. SMTP configuration
    // =========================
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    const port = Number(process.env.SMTP_PORT?.trim()) || 587;

    if (!host || !user || !pass) {
      console.error("[send-otp] Missing SMTP environment variables.");

      return NextResponse.json(
        {
          ok: false,
          error: "الإيميل مش متظبط على السيرفر لسه.",
        },
        { status: 500 }
      );
    }

    // =========================
    // 5. Generate OTP
    // =========================
    const code = crypto.randomInt(100000, 1000000).toString();

    // =========================
    // 6. Create SMTP transporter
    // =========================
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,

      auth: {
        user,
        pass,
      },

      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    // =========================
    // 7. Verify SMTP
    // =========================
    try {
      await transporter.verify();
    } catch (error) {
      console.error("[send-otp] SMTP verify failed:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "مش قادر أتصل بخدمة الإيميل حاليًا.",
        },
        { status: 500 }
      );
    }

    // =========================
    // 8. Send OTP email
    // =========================
    try {
      await transporter.sendMail({
        from: `"تسجيل مشاريع AI Engineering" <${user}>`,
        to: clean,

        subject: "كود التحقق — تسجيل مشروع التخرج",

        html: `
          <div
            dir="rtl"
            style="
              font-family:Tahoma,Arial,sans-serif;
              font-size:15px;
              color:#111;
              max-width:600px;
              margin:auto;
            "
          >

            <h2>تأكيد الإيميل الجامعي</h2>

            <p>أهلًا،</p>

            <p>
              استخدم كود التحقق التالي لإكمال تسجيل مشروع التخرج:
            </p>

            <div
              style="
                font-size:32px;
                font-weight:900;
                letter-spacing:8px;
                color:#06265b;
                margin:24px 0;
              "
            >
              ${code}
            </div>

            <p style="color:#777;font-size:13px;">
              الكود صالح لمدة 10 دقائق فقط.
            </p>

            <p style="color:#777;font-size:13px;">
              إذا لم تطلب هذا الكود، يمكنك تجاهل هذه الرسالة.
            </p>

          </div>
        `,
      });
    } catch (error) {
      console.error("[send-otp] sendMail failed:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "فشل إرسال الإيميل. حاول مرة أخرى.",
        },
        { status: 500 }
      );
    }

    // =========================
    // 9. Save OTP AFTER email succeeds
    // =========================
    try {
      await saveOtp(clean, code, 10);
    } catch (error) {
      console.error("[send-otp] saveOtp failed:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "تم إرسال الكود لكن حدث خطأ في حفظ جلسة التحقق.",
        },
        { status: 500 }
      );
    }

    // =========================
    // 10. Success
    // =========================
    return NextResponse.json(
      {
        ok: true,
        message: "تم إرسال كود التحقق إلى إيميلك الجامعي.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[send-otp] Unexpected error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "حصل خطأ أثناء إرسال كود التحقق.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
