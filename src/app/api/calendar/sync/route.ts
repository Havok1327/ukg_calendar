import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvents } from "@/lib/google-calendar";
import { Shift } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, shifts } = (await request.json()) as {
      accessToken: string;
      shifts: Shift[];
    };

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 401 }
      );
    }

    if (!shifts || shifts.length === 0) {
      return NextResponse.json(
        { error: "No shifts provided" },
        { status: 400 }
      );
    }

    const result = await createCalendarEvents(accessToken, shifts);

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
