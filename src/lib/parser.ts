import { Shift } from "@/types";

let nextId = 1;
function generateId(): string {
  return String(nextId++);
}

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04",
  may: "05", jun: "06", jul: "07", aug: "08",
  sep: "09", oct: "10", nov: "11", dec: "12",
};

const DAY_NAMES = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i;

/**
 * Parse raw OCR text from UKG mobile schedule screenshots.
 *
 * Actual UKG format (from OCR):
 *   February 2026 v          ← month/year header
 *   Fri                      ← day of week
 *   20 4 9:30 AM-5:30 PM [8:00]  ← day number + noise + time range + [duration]
 *   REI/REI/Retail/East/...  ← department/location (title)
 *   February 22 - 28         ← week header (may change current month)
 *   March O1 - 07            ← week header with new month
 */
export function parseScheduleText(rawText: string): Shift[] {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const shifts: Shift[] = [];

  let currentMonth = "";
  let currentYear = "";
  let pendingDayOfWeek = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match month/year header: "February 2026 v" or "February 2026"
    const monthYearMatch = line.match(
      /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i
    );
    if (monthYearMatch) {
      currentMonth = MONTHS[monthYearMatch[1].toLowerCase().slice(0, 3)];
      currentYear = monthYearMatch[2];
      continue;
    }

    // Match week header: "February 22 - 28" or "March O1 - 07"
    // These can update the current month
    const weekHeaderMatch = line.match(
      /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\S+\s*[-–—]\s*\S+/i
    );
    if (weekHeaderMatch) {
      currentMonth = MONTHS[weekHeaderMatch[1].toLowerCase().slice(0, 3)];
      continue;
    }

    // Match day-of-week line: "Fri", "Sat", etc.
    if (DAY_NAMES.test(line) && line.length <= 10) {
      pendingDayOfWeek = line;
      continue;
    }

    // Match shift line: "20 4 9:30 AM-5:30 PM [8:00]"
    // Pattern: day_number <optional noise> time_range
    const shiftMatch = line.match(
      /^(\d{1,2})\s+.*?(\d{1,2}:\d{2}\s*[AaPp][Mm])\s*[-–—]\s*(\d{1,2}:\d{2}\s*[AaPp][Mm])/
    );
    if (shiftMatch && currentMonth && currentYear) {
      const day = shiftMatch[1].padStart(2, "0");
      const startTime = normalizeTo24h(shiftMatch[2]);
      const endTime = normalizeTo24h(shiftMatch[3]);
      const date = `${currentYear}-${currentMonth}-${day}`;

      // Look ahead for title — grab the last segment of the department path
      // e.g. "REI/REI/Retail/East/Midwest/0073/Hardgoods/Cycling" → "Cycling"
      let title = "";
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        // Stop if we hit a day name, month header, week header, or another shift line
        if (DAY_NAMES.test(nextLine)) break;
        if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(nextLine)) break;
        if (/^\d{1,2}\s+.*?\d{1,2}:\d{2}/.test(nextLine)) break;
        if (/^(Home|Inbox|Menu|Schedule|My Schedule)/i.test(nextLine)) break;
        // Accumulate department path lines
        if (nextLine.length > 0) {
          title = title ? title + " " + nextLine : nextLine;
        }
      }
      // Extract last two segments from the slash-separated path
      // e.g. "REI/REI/Retail/East/Midwest/0073/Hardgoods/Cycling" → "Hardgoods - Cycling"
      if (title.includes("/")) {
        const segments = title.split("/").map((s) => s.trim()).filter(Boolean);
        if (segments.length >= 2) {
          title = `${segments[segments.length - 2]} - ${segments[segments.length - 1]}`;
        } else {
          title = segments[segments.length - 1] || "Work Shift";
        }
      }

      shifts.push({
        id: generateId(),
        date,
        startTime,
        endTime,
        title: title || "Work Shift",
      });

      pendingDayOfWeek = "";
      continue;
    }
  }

  return shifts;
}

function normalizeTo24h(timeStr: string): string {
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes("P");
  const isAM = cleaned.includes("A");
  const timePart = cleaned.replace(/[APM\s]/g, "");
  const [hourStr, minute] = timePart.split(":");
  let hour = parseInt(hourStr, 10);

  if (isPM && hour !== 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}
