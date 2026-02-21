export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  imageIndex?: number; // which source screenshot this shift came from
}

export interface ParsedSchedule {
  shifts: Shift[];
  rawText: string;
  confidence: number;
}

export type WorkflowStep = "upload" | "processing" | "review" | "export";
