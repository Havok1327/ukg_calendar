"use client";

import { useState, useEffect } from "react";
import { processImage } from "@/lib/ocr";
import { parseScheduleText } from "@/lib/parser";
import { Shift } from "@/types";

interface OcrProcessorProps {
  imageFile: File;
  onComplete: (shifts: Shift[], rawText: string) => void;
  onError: (error: string) => void;
}

export default function OcrProcessor({
  imageFile,
  onComplete,
  onError,
}: OcrProcessorProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing OCR engine...");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setStatus("Processing image...");
        const result = await processImage(imageFile, (p) => {
          if (!cancelled) setProgress(p);
        });

        if (cancelled) return;

        setStatus("Parsing schedule data...");
        setProgress(100);

        const shifts = parseScheduleText(result.text);
        onComplete(shifts, result.text);
      } catch (e) {
        if (!cancelled) {
          onError((e as Error).message);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [imageFile, onComplete, onError]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
        <span className="text-gray-700">{status}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 text-center">{progress}% complete</p>
    </div>
  );
}
