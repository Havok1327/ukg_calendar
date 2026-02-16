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

export function downloadIcs(icsContent: string, filename = "ukg-schedule.ics") {
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
