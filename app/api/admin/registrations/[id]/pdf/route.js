import fs from "fs";
import { getRegistrationPdfPath } from "../../../../../lib/db";

export async function GET(request, { params }) {
  const auth = request.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || auth !== expected) {
    return Response.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const filePath = getRegistrationPdfPath(id);

  if (!filePath) {
    return Response.json({ ok: false, error: "الملف مش موجود." }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="registration_${id}.pdf"`,
    },
  });
}
