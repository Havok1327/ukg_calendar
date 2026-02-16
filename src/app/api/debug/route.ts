import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    const filePath = join(process.cwd(), "ocr-output.txt");
    await writeFile(filePath, text, "utf-8");
    return NextResponse.json({ ok: true, path: filePath });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
