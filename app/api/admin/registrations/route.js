import { listRegistrations } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAdminPassword(request) {
  return (
    request.headers.get(
      "x-admin-password"
    ) || ""
  );
}

export async function GET(request) {
  try {
    const auth =
      getAdminPassword(request);

    const expected =
      process.env.ADMIN_PASSWORD || "";

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

    if (
      !auth ||
      auth !== expected
    ) {
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
