import { get } from "@vercel/blob";

import {
  getRegistrationPdfPath,
} from "../../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request,
  { params }
) {
  try {
    /* =====================================================
       1. Admin Authentication
    ===================================================== */

    const auth =
      request.headers.get(
        "x-admin-password"
      ) || "";

    const expected =
      process.env.ADMIN_PASSWORD ||
      "";

    if (!expected) {
      return Response.json(
        {
          ok: false,
          error:
            "ADMIN_PASSWORD مش متظبط.",
        },
        {
          status: 500,
        }
      );
    }

    if (auth !== expected) {
      return Response.json(
        {
          ok: false,
          error: "غير مصرح.",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       2. Get ID
    ===================================================== */

    const { id } = await params;

    if (!id) {
      return Response.json(
        {
          ok: false,
          error:
            "Registration ID مطلوب.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       3. Get PDF pathname
    ===================================================== */

    const pathname =
      await getRegistrationPdfPath(
        id
      );

    if (!pathname) {
      return Response.json(
        {
          ok: false,
          error:
            "الملف مش موجود.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       4. Get Private Blob
    ===================================================== */

    const result =
      await get(
        pathname,
        {
          access: "private",
        }
      );

    if (!result) {
      return Response.json(
        {
          ok: false,
          error:
            "تعذر الوصول إلى ملف PDF.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       5. Return PDF
    ===================================================== */

    return new Response(
      result.stream,
      {
        status: 200,

        headers: {
          "Content-Type":
            result.blob?.contentType ||
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="registration_${id}.pdf"`,

          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "[admin/pdf] error:",
      error
    );

    return Response.json(
      {
        ok: false,
        error:
          "حدث خطأ أثناء تحميل ملف PDF.",
      },
      {
        status: 500,
      }
    );
  }
}
