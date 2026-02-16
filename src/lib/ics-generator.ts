import { createEvents, EventAttributes } from "ics";
import { Shift } from "@/types";

export function generateIcs(shifts: Shift[]): string {
  const events: EventAttributes[] = shifts.map((shift) => {
    const [year, month, day] = shift.date.split("-").map(Number);
    const [startHour, startMinute] = shift.startTime.split(":").map(Number);
    const [endHour, endMinute] = shift.endTime.split(":").map(Number);

    // Stable UID based on date — re-importing updates existing events
    // instead of creating duplicates
    const uid = `ukg-shift-${shift.date}@ukg-calendar-sync`;

    return {
      uid,
      title: shift.title || "Work Shift",
      start: [year, month, day, startHour, startMinute],
      end: [year, month, day, endHour, endMinute],
      status: "CONFIRMED" as const,
    };
  });

  const { value, error } = createEvents(events);

  if (error) {
    throw new Error(`Failed to generate ICS: ${error.message}`);
  }

  return value || "";
}

export async function downloadIcs(icsContent: string, filename = "ukg-schedule.ics") {
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIos) {
    // On iOS/iPadOS, blob downloads don't trigger the Calendar app.
    // Instead, POST the ICS to a server endpoint that responds with
    // Content-Type: text/calendar — Safari will then offer to open
    // the file in Calendar.
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/ics";
    form.target = "_blank";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "icsContent";
    input.value = icsContent;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  } else {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
