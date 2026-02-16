import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const icsContent = formData.get("icsContent") as string;

  if (!icsContent) {
    return NextResponse.json({ error: "No content" }, { status: 400 });
  }

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ukg-schedule.ics"',
    },
  });
}
