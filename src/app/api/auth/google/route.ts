import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  try {
    const authUrl = getGoogleAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch {
    return NextResponse.redirect(
      new URL("/?sync=error&message=Google+OAuth+not+configured", process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000")
    );
  }
}
