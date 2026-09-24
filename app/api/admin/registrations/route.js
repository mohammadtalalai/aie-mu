import {
  listRegistrations,
} from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request
) {
  try {
    /* =====================================================
       Authentication
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
            "ADMIN_PASSWORD مش متظبط على السيرفر.",
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
          error: "الباسورد غلط.",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       Database
    ===================================================== */

    const registrations =
      await listRegistrations();

    return Response.json(
      {
        ok: true,
        registrations,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "[admin/registrations] failed:",
      error
    );

    return Response.json(
      {
        ok: false,
        error:
          "حصل خطأ في قراءة قاعدة البيانات.",
      },
      {
        status: 500,
      }
    );
  }
}
