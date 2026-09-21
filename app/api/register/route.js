import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../lib/session";
import { saveRegistration } from "../../lib/db";

export const runtime = "nodejs";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

function clean(value) {
  return String(value ?? "").trim();
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateRegistration(data) {
  if (!data || typeof data !== "object") {
    return "بيانات التسجيل غير صحيحة.";
  }

  const requiredFields = [
    ["courseTitle", "المشروع المختار"],
    ["titleAr", "العنوان بالعربي"],
    ["titleEn", "Project Title"],
    ["leaderName", "اسم قائد الفريق"],
    ["leaderEmail", "إيميل قائد الفريق"],
    ["leaderPhone", "رقم الهاتف"],
    ["goal", "هدف المشروع"],
    ["aiLink", "ربط المشروع بالتخصص"],
    ["communityService", "الخدمة المجتمعية"],
  ];

  for (const [field, label] of requiredFields) {
    if (!clean(data[field])) {
      return `برجاء إدخال ${label}.`;
    }
  }

  const email = clean(data.leaderEmail);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "إيميل قائد الفريق غير صحيح.";
  }

  if (!Array.isArray(data.team)) {
    return "بيانات الفريق غير صحيحة.";
  }

  if (!Array.isArray(data.supervisors)) {
    return "بيانات المشرفين غير صحيحة.";
  }

  if (!Array.isArray(data.keywords)) {
    return "الكلمات المفتاحية غير صحيحة.";
  }

  if (data.team.length > 20) {
    return "عدد أعضاء الفريق أكبر من الحد المسموح.";
  }

  if (data.supervisors.length > 10) {
    return "عدد المشرفين أكبر من الحد المسموح.";
  }

  for (const member of data.team) {
    if (!member || typeof member !== "object") {
      return "بيانات أحد أعضاء الفريق غير صحيحة.";
    }

    if (!clean(member.name)) {
      return "كل أعضاء الفريق يجب أن يكون لهم اسم.";
    }
  }

  return null;
}

function validatePdf(pdfBase64) {
  if (typeof pdfBase64 !== "string" || !pdfBase64) {
    return "ملف PDF مطلوب.";
  }

  const prefix = "data:application/pdf;base64,";

  if (!pdfBase64.startsWith(prefix)) {
    return "الملف المرفوع يجب أن يكون PDF صالحًا.";
  }

  const base64Data = pdfBase64.slice(prefix.length);

  if (!base64Data) {
    return "ملف PDF فارغ.";
  }

  // Base64 length is approximately 4/3 of the original size.
  const estimatedSize = Math.floor((base64Data.length * 3) / 4);

  if (estimatedSize > MAX_PDF_SIZE) {
    return "حجم ملف PDF يجب ألا يتجاوز 10MB.";
  }

  // Basic Base64 validation.
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
    return "بيانات ملف PDF غير صحيحة.";
  }

  return null;
}

function buildTeamHtml(team) {
  if (!Array.isArray(team) || team.length === 0) {
    return "<li>لم يتم إدخال أعضاء.</li>";
  }

  return team
    .filter((member) => clean(member?.name))
    .map((member) => {
      const name = escapeHtml(member.name);
      const hours = escapeHtml(member.hours) || "?";
      const gpa = escapeHtml(member.gpa) || "?";

      return `
        <li>
          ${name} —
          ${hours} ساعة معتمدة —
          GPA ${gpa}
        </li>
      `;
    })
    .join("");
}

function buildSupervisorsHtml(supervisors) {
  if (!Array.isArray(supervisors) || supervisors.length === 0) {
    return "<li>—</li>";
  }

  const items = supervisors
    .filter(Boolean)
    .map((supervisor) => {
      return `<li>${escapeHtml(supervisor)}</li>`;
    })
    .join("");

  return items || "<li>—</li>";
}

function buildKeywordsHtml(keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return "—";
  }

  return keywords
    .filter(Boolean)
    .map((keyword) => escapeHtml(keyword))
    .join("، ");
}

function buildEmailHtml(data, sessionEmail) {
  const teamHtml = buildTeamHtml(data.team);
  const supervisorsHtml = buildSupervisorsHtml(data.supervisors);
  const keywordsHtml = buildKeywordsHtml(data.keywords);

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>تسجيل مشروع تخرج جديد</title>
      </head>

      <body
        style="
          margin:0;
          padding:30px;
          background:#f8fafc;
          font-family:Tahoma,Arial,sans-serif;
          color:#111827;
        "
      >
        <div
          style="
            max-width:700px;
            margin:auto;
            background:#ffffff;
            border-radius:12px;
            padding:30px;
            border:1px solid #e5e7eb;
          "
        >

          <h2
            style="
              color:#06265b;
              margin:0 0 5px;
            "
          >
            📥 تسجيل مشروع تخرج جديد
          </h2>

          <p
            style="
              color:#64748b;
              margin-top:0;
            "
          >
            وصل تسجيل جديد من صفحة Project Registration
          </p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

          <table
            style="
              border-collapse:collapse;
              width:100%;
              font-size:14px;
            "
          >

            <tr>
              <td style="padding:8px 0;font-weight:bold;width:180px;">
                المشروع المختار
              </td>
              <td style="padding:8px 0;">
                ${escapeHtml(data.courseTitle)}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0;font-weight:bold;">
                العنوان بالعربي
              </td>
              <td style="padding:8px 0;">
                ${escapeHtml(data.titleAr)}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0;font-weight:bold;">
                Project Title
              </td>
              <td style="padding:8px 0;">
                ${escapeHtml(data.titleEn)}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0;font-weight:bold;">
                قائد الفريق
              </td>
              <td style="padding:8px 0;">
                ${escapeHtml(data.leaderName)}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0;font-weight:bold;">
                إيميل القائد
              </td>
              <td style="padding:8px 0;">
                ${escapeHtml(data.leaderEmail)}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0;font-weight:bold;">
                موبايل القائد
              </td>
              <td style="padding:8px 0;">
                ${escapeHtml(data.leaderPhone)}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0;font-weight:bold;">
                إيميل التحقق
              </td>
              <td style="padding:8px 0;">
                ${escapeHtml(sessionEmail)}
              </td>
            </tr>

            <tr>
              <td style="padding:8px 0;font-weight:bold;">
                الكلمات المفتاحية
              </td>
              <td style="padding:8px 0;">
                ${keywordsHtml}
              </td>
            </tr>

          </table>

          <div style="margin-top:25px;">

            <h3 style="margin-bottom:8px;">
              👨‍🏫 فريق الإشراف
            </h3>

            <ul>
              ${supervisorsHtml}
            </ul>

          </div>

          <div style="margin-top:25px;">

            <h3 style="margin-bottom:8px;">
              👥 فريق المشروع
            </h3>

            <ul>
              ${teamHtml}
            </ul>

          </div>

          <div style="margin-top:25px;">

            <h3 style="margin-bottom:8px;">
              🎯 الهدف من المشروع
            </h3>

            <p style="white-space:pre-wrap;">
              ${escapeHtml(data.goal)}
            </p>

          </div>

          <div style="margin-top:25px;">

            <h3 style="margin-bottom:8px;">
              🤖 ربط المشروع بتخصص الذكاء الاصطناعي
            </h3>

            <p style="white-space:pre-wrap;">
              ${escapeHtml(data.aiLink)}
            </p>

          </div>

          <div style="margin-top:25px;">

            <h3 style="margin-bottom:8px;">
              🌍 ربط المشروع بالخدمة المجتمعية
            </h3>

            <p style="white-space:pre-wrap;">
              ${escapeHtml(data.communityService)}
            </p>

          </div>

          <div
            style="
              margin-top:30px;
              padding:15px;
              background:#f1f5f9;
              border-radius:8px;
              color:#64748b;
              font-size:13px;
            "
          >
            النموذج الكامل مرفق بهذا البريد كملف PDF.
          </div>

        </div>
      </body>
    </html>
  `;
}

function createTransporter() {
  const host = clean(process.env.SMTP_HOST);
  const user = clean(process.env.SMTP_USER);
  const pass = clean(process.env.SMTP_PASS);

  const rawPort = clean(process.env.SMTP_PORT);
  const port = Number(rawPort) || 587;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function POST(request) {
  try {
    // --------------------------------------------------
    // 1. Verify session
    // --------------------------------------------------

    const cookieStore = await cookies();

    const token = cookieStore.get("reg_session")?.value;

    if (!token) {
      return Response.json(
        {
          ok: false,
          error: "لازم تتحقق من الإيميل الجامعي الأول قبل التسجيل.",
        },
        { status: 401 }
      );
    }

    const session = verifySessionToken(token);

    if (!session || !session.email) {
      return Response.json(
        {
          ok: false,
          error: "جلسة التحقق غير صالحة أو منتهية. تحقق من الإيميل مرة أخرى.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Parse request body
    // --------------------------------------------------

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          ok: false,
          error: "بيانات الطلب غير صحيحة.",
        },
        { status: 400 }
      );
    }

    const { data, pdfBase64 } = body || {};

    // --------------------------------------------------
    // 3. Validate form
    // --------------------------------------------------

    const validationError = validateRegistration(data);

    if (validationError) {
      return Response.json(
        {
          ok: false,
          error: validationError,
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Validate PDF
    // --------------------------------------------------

    const pdfError = validatePdf(pdfBase64);

    if (pdfError) {
      return Response.json(
        {
          ok: false,
          error: pdfError,
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Make sure leader email matches verified email
    // --------------------------------------------------

    const verifiedEmail = clean(session.email).toLowerCase();
    const leaderEmail = clean(data.leaderEmail).toLowerCase();

    if (verifiedEmail !== leaderEmail) {
      return Response.json(
        {
          ok: false,
          error:
            "إيميل قائد الفريق يجب أن يكون نفس الإيميل الجامعي الذي تم التحقق منه.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 6. SMTP configuration
    // --------------------------------------------------

    const adminEmail = clean(process.env.ADMIN_EMAIL);

    if (!adminEmail) {
      console.error("[register] ADMIN_EMAIL is missing.");

      return Response.json(
        {
          ok: false,
          error: "خدمة التسجيل غير متاحة حاليًا. حاول مرة أخرى لاحقًا.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 7. Decode PDF
    // --------------------------------------------------

    const prefix = "data:application/pdf;base64,";

    const base64Data = pdfBase64.slice(prefix.length);

    // --------------------------------------------------
    // 8. Generate safe filename
    // --------------------------------------------------

    const safeName =
      clean(data.titleEn)
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 100) || "project";

    const filename = `${safeName}_Registration.pdf`;

    // --------------------------------------------------
    // 9. Save registration
    // --------------------------------------------------

    // IMPORTANT:
    // saveRegistration() should use a real persistent database/storage
    // in production. Do NOT depend on local filesystem on Vercel.

    const registration = await saveRegistration(
      session.email,
      data,
      pdfBase64
    );

    // saveRegistration can optionally return an ID.
    const registrationId =
      registration?.id ||
      registration?.registrationId ||
      `REG-${Date.now()}`;

    // --------------------------------------------------
    // 10. Build email
    // --------------------------------------------------

    const html = buildEmailHtml(data, session.email);

    // --------------------------------------------------
    // 11. Create SMTP transporter
    // --------------------------------------------------

    const transporter = createTransporter();

    // --------------------------------------------------
    // 12. Verify SMTP
    // --------------------------------------------------

    try {
      await transporter.verify();
    } catch (smtpError) {
      console.error("[register] SMTP verification failed:", smtpError);

      return Response.json(
        {
          ok: false,
          error:
            "تم حفظ التسجيل، لكن حدث خطأ أثناء إرسال الإيميل للإدارة. يرجى التواصل مع الإدارة إذا لم يصلك تأكيد.",
          registrationId,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 13. Send email
    // --------------------------------------------------

    try {
      await transporter.sendMail({
        from: `"AI Engineering Registration" <${clean(
          process.env.SMTP_USER
        )}>`,

        to: adminEmail,

        replyTo: leaderEmail,

        subject: `تسجيل مشروع جديد: ${
          clean(data.titleEn) ||
          clean(data.titleAr) ||
          "بدون عنوان"
        }`,

        html,

        attachments: [
          {
            filename,
            content: base64Data,
            encoding: "base64",
            contentType: "application/pdf",
          },
        ],
      });
    } catch (emailError) {
      console.error("[register] Email sending failed:", emailError);

      return Response.json(
        {
          ok: false,
          error:
            "تم حفظ بيانات التسجيل، لكن تعذر إرسال البريد الإلكتروني للإدارة.",
          registrationId,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 14. Success
    // --------------------------------------------------

    return Response.json(
      {
        ok: true,
        message: "تم تسجيل مشروع التخرج بنجاح.",
        registrationId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[register] Unexpected server error:", error);

    return Response.json(
      {
        ok: false,
        error: "حدث خطأ غير متوقع أثناء التسجيل. حاول مرة أخرى.",
      },
      { status: 500 }
    );
  }
}
