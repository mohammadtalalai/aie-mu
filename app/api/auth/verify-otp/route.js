import { verifyOtp } from "../../../lib/db";
import { createSessionToken } from "../../../lib/session";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch (error) {
      console.error("[verify-otp] Invalid JSON body:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "بيانات الطلب غير صحيحة.",
        },
        { status: 400 }
      );
    }

    const email = body?.email;
    const code = body?.code;

    const clean = String(email || "")
      .trim()
      .toLowerCase();

    const cleanCode = String(code || "").trim();

    if (!clean || !cleanCode) {
      return NextResponse.json(
        {
          ok: false,
          error: "اكتب الإيميل والكود.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return NextResponse.json(
        {
          ok: false,
          error: "الإيميل غير صحيح.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json(
        {
          ok: false,
          error: "كود التحقق يجب أن يكون 6 أرقام.",
        },
        { status: 400 }
      );
    }

    let result;

    try {
      result = verifyOtp(clean, cleanCode);
    } catch (error) {
      console.error("[verify-otp] Database error:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "حدث خطأ أثناء التحقق من الكود.",
        },
        { status: 500 }
      );
    }

    if (!result?.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result?.reason || "كود التحقق غير صحيح.",
        },
        { status: 400 }
      );
    }

    let token;

    try {
      token = createSessionToken(clean, 60);
    } catch (error) {
      console.error("[verify-otp] Session creation failed:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "حدث خطأ أثناء إنشاء جلسة التحقق.",
        },
        { status: 500 }
      );
    }

    const response = NextResponse.json(
      {
        ok: true,
        email: clean,
        message: "تم تأكيد الإيميل بنجاح.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set({
      name: "reg_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[verify-otp] Unexpected error:", error);

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
