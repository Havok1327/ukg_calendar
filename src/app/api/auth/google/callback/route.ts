import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const baseUrl = request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/?sync=error&message=${encodeURIComponent("Google authorization denied")}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/?sync=error&message=${encodeURIComponent("No authorization code received")}`
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // Redirect back to the app with the access token in a fragment (client-side only)
    // The client will use this to call the sync API
    return NextResponse.redirect(
      `${baseUrl}/?access_token=${tokens.access_token}&sync=ready`
    );
  } catch {
    return NextResponse.redirect(
      `${baseUrl}/?sync=error&message=${encodeURIComponent("Failed to complete authorization")}`
    );
  }
}
