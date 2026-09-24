import { getRegistrationPdf } from "../../../../../lib/db";
import { checkAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request, { params }) {
  const auth = checkAdmin(request);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const pdf = await getRegistrationPdf(id);
    if (!pdf) {
      return Response.json({ ok: false, error: "الملف مش موجود." }, { status: 404 });
    }

    // pdf.base64 ممكن يكون data URI كامل ("data:application/pdf;base64,...")
    // أو base64 خام — بنتعامل مع الحالتين.
    const base64Data = String(pdf.base64).split(",").pop();
    const buffer = Buffer.from(base64Data, "base64");

    const safeName =
      (pdf.titleEn || pdf.titleAr || "Registration")
        .replace(/[^a-z0-9\-_ ]/gi, "")
        .trim()
        .replace(/\s+/g, "_") || "Registration";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}_${id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[admin/registrations/pdf] failed:", err);
    return Response.json(
      { ok: false, error: err?.message || "حصل خطأ أثناء تحميل الملف." },
      { status: 500 }
    );
  }
}
