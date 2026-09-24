import { verifyOtp } from "../../../lib/db";
import { createSessionToken } from "../../../lib/session";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function clean(value) {
  return String(value ?? "").trim();
}

export async function POST(request) {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Parse JSON
    |--------------------------------------------------------------------------
    */

    let body;

    try {
      body = await request.json();
    } catch (error) {
      console.error(
        "[verify-otp] Invalid JSON:",
        error
      );

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
    | 2. Read values
    |--------------------------------------------------------------------------
    */

    const email = clean(body?.email).toLowerCase();
    const code = clean(body?.code);

    /*
    |--------------------------------------------------------------------------
    | 3. Validate
    |--------------------------------------------------------------------------
    */

    if (!email || !code) {
      return NextResponse.json(
        {
          ok: false,
          error: "اكتب الإيميل والكود.",
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
          error: "الإيميل غير صحيح.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          ok: false,
          error: "كود التحقق يجب أن يكون 6 أرقام.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Verify OTP
    |--------------------------------------------------------------------------
    */

    let result;

    try {
      result = await verifyOtp(email, code);
    } catch (error) {
      console.error(
        "[verify-otp] Database error:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          error: "حدث خطأ أثناء التحقق من الكود.",
        },
        {
          status: 500,
        }
      );
    }

    if (!result?.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            result?.reason ||
            "كود التحقق غير صحيح.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Create Session
    |--------------------------------------------------------------------------
    */

    let token;

    try {
      token = createSessionToken(email, 60);
    } catch (error) {
      console.error(
        "[verify-otp] Session creation failed:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "حدث خطأ أثناء إنشاء جلسة التحقق.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Response
    |--------------------------------------------------------------------------
    */

    const response = NextResponse.json(
      {
        ok: true,
        email,
        message: "تم تأكيد الإيميل بنجاح.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    /*
    |--------------------------------------------------------------------------
    | 7. Cookie
    |--------------------------------------------------------------------------
    */

    response.cookies.set({
      name: "reg_session",

      value: token,

      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error(
      "[verify-otp] Unexpected error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "حصل خطأ أثناء التحقق.",
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
