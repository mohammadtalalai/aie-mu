import { verifyOtp } from "../../../lib/db";
import { createSessionToken } from "../../../lib/session";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = body?.email;
    const code = body?.code;

    const clean = String(email || "").trim().toLowerCase();
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

    const result = verifyOtp(clean, cleanCode);

    if (!result?.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result?.reason || "كود التحقق غير صحيح.",
        },
        { status: 400 }
      );
    }

    const token = createSessionToken(clean, 60);

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
    console.error("[verify-otp] failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "حصل خطأ أثناء التحقق.",
      },
      { status: 500 }
    );
  }
}
