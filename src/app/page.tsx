"use client";

import { useState, useCallback } from "react";
import ImageUpload from "@/components/ImageUpload";
import OcrProcessor from "@/components/OcrProcessor";
import ShiftTable from "@/components/ShiftTable";
import ExportOptions from "@/components/ExportOptions";
import { Shift, WorkflowStep } from "@/types";

export default function Home() {
  const [step, setStep] = useState<WorkflowStep>("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = useCallback((file: File) => {
    setImageFile(file);
    setError(null);
    setStep("processing");
  }, []);

  const handleOcrComplete = useCallback((extractedShifts: Shift[], text: string) => {
    setShifts(extractedShifts);
    setRawText(text);
    setStep("review");
  }, []);

  const handleOcrError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setStep("upload");
  }, []);

  const handleReset = () => {
    setStep("upload");
    setImageFile(null);
    setShifts([]);
    setRawText("");
    setError(null);
  };

  const steps: { key: WorkflowStep; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "processing", label: "Process" },
    { key: "review", label: "Review" },
    { key: "export", label: "Export" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            UKG Calendar Sync
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Upload your schedule screenshot and export to your calendar
          </p>
        </div>

        {/* Progress Steps — compact horizontal bar on mobile */}
        <div className="flex items-center justify-between mb-5 sm:mb-8 px-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0 ${
                    i <= currentStepIndex
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    i <= currentStepIndex
                      ? "text-blue-600 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 sm:mx-3 mt-[-1rem] ${
                    i < currentStepIndex ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          {step === "upload" && (
            <ImageUpload onImageSelected={handleImageSelected} />
          )}

          {step === "processing" && imageFile && (
            <OcrProcessor
              imageFile={imageFile}
              onComplete={handleOcrComplete}
              onError={handleOcrError}
            />
          )}

          {step === "review" && (
            <div className="space-y-4 sm:space-y-6">
              <ShiftTable
                shifts={shifts}
                onShiftsChange={setShifts}
                rawText={rawText}
              />
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <button
                  onClick={handleReset}
                  className="px-4 py-3 sm:py-2 text-sm text-gray-600 active:text-gray-800 transition-colors rounded-lg"
                >
                  Start Over
                </button>
                <button
                  onClick={() => setStep("export")}
                  disabled={shifts.length === 0}
                  className="px-6 py-3 sm:py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Continue to Export
                </button>
              </div>
            </div>
          )}

          {step === "export" && (
            <div className="space-y-4 sm:space-y-6">
              <ExportOptions shifts={shifts} />
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <button
                  onClick={handleReset}
                  className="px-4 py-3 sm:py-2 text-sm text-gray-600 active:text-gray-800 transition-colors rounded-lg"
                >
                  Start Over
                </button>
                <button
                  onClick={() => setStep("review")}
                  className="px-4 py-3 sm:py-2 text-sm text-gray-600 border border-gray-300 rounded-lg active:bg-gray-50 transition-colors"
                >
                  Back to Edit
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 sm:mt-6 text-center text-xs text-gray-400">
          All processing happens in your browser. No data is sent to any server.
        </p>
      </div>
    </main>
  );
}
