import crypto from "crypto";
import nodemailer from "nodemailer";
import { saveOtp } from "../../../lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function clean(value) {
  return String(value ?? "").trim();
}

function getAllowedEmailDomain() {
  return (
    process.env.ALLOWED_EMAIL_DOMAIN ||
    "@std.mans.edu.eg"
  )
    .trim()
    .toLowerCase();
}

export async function POST(request) {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Read JSON
    |--------------------------------------------------------------------------
    */

    let body;

    try {
      body = await request.json();
    } catch (error) {
      console.error("[send-otp] Invalid JSON:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "بيانات الطلب غير صحيحة.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Email
    |--------------------------------------------------------------------------
    */

    const email = clean(body?.email).toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          ok: false,
          error: "اكتب الإيميل الجامعي.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          ok: false,
          error: "اكتب إيميل صحيح.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 3. University Domain
    |--------------------------------------------------------------------------
    */

    const allowedDomain = getAllowedEmailDomain();

    if (!email.endsWith(allowedDomain)) {
      return NextResponse.json(
        {
          ok: false,
          error: `لازم تستخدم الإيميل الجامعي اللي بينتهي بـ ${allowedDomain}.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 4. SMTP
    |--------------------------------------------------------------------------
    */

    const host = clean(process.env.SMTP_HOST);
    const user = clean(process.env.SMTP_USER);
    const pass = clean(process.env.SMTP_PASS);

    const port =
      Number(clean(process.env.SMTP_PORT)) || 587;

    if (!host || !user || !pass) {
      console.error("[send-otp] Missing SMTP configuration.");

      return NextResponse.json(
        {
          ok: false,
          error: "الإيميل مش متظبط على السيرفر لسه.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Generate OTP
    |--------------------------------------------------------------------------
    */

    const code = crypto
      .randomInt(100000, 1000000)
      .toString();

    /*
    |--------------------------------------------------------------------------
    | 6. Transporter
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | 7. Verify SMTP
    |--------------------------------------------------------------------------
    */

    try {
      await transporter.verify();
    } catch (error) {
      console.error(
        "[send-otp] SMTP verify failed:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          error: "مش قادر أتصل بخدمة الإيميل حاليًا.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 8. Send OTP
    |--------------------------------------------------------------------------
    */

    try {
      await transporter.sendMail({
        from: `"AI Engineering Registration" <${user}>`,

        to: email,

        subject: "كود التحقق — تسجيل مشروع التخرج",

        html: `
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
            <head>
              <meta charset="UTF-8" />
            </head>

            <body
              style="
                margin:0;
                padding:30px;
                background:#f8fafc;
                font-family:Tahoma,Arial,sans-serif;
              "
            >

              <div
                style="
                  max-width:600px;
                  margin:auto;
                  background:#ffffff;
                  border-radius:12px;
                  padding:30px;
                  border:1px solid #e5e7eb;
                "
              >

                <h2 style="color:#06265b;">
                  تأكيد الإيميل الجامعي
                </h2>

                <p>
                  أهلًا،
                </p>

                <p>
                  استخدم كود التحقق التالي لإكمال
                  تسجيل مشروع التخرج:
                </p>

                <div
                  style="
                    font-size:34px;
                    font-weight:900;
                    letter-spacing:8px;
                    color:#06265b;
                    margin:30px 0;
                    text-align:center;
                  "
                >
                  ${code}
                </div>

                <p
                  style="
                    color:#777;
                    font-size:13px;
                  "
                >
                  الكود صالح لمدة 10 دقائق فقط.
                </p>

                <p
                  style="
                    color:#777;
                    font-size:13px;
                  "
                >
                  إذا لم تطلب هذا الكود،
                  يمكنك تجاهل الرسالة.
                </p>

              </div>

            </body>
          </html>
        `,
      });
    } catch (error) {
      console.error(
        "[send-otp] sendMail failed:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          error: "فشل إرسال الإيميل. حاول مرة أخرى.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 9. Save OTP
    |--------------------------------------------------------------------------
    */

    try {
      await saveOtp(email, code, 10);
    } catch (error) {
      console.error(
        "[send-otp] saveOtp failed:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "تم إرسال الكود لكن حدث خطأ في حفظ جلسة التحقق.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 10. Success
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        ok: true,
        message:
          "تم إرسال كود التحقق إلى إيميلك الجامعي.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "[send-otp] Unexpected error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "حصل خطأ أثناء إرسال كود التحقق.",
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
