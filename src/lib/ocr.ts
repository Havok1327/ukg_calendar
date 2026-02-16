import Tesseract from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function processImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  // Convert to data URL first — passing File objects directly
  // fails on some mobile browsers (code=0 error)
  const dataUrl = await fileToDataUrl(imageFile);

  const result = await Tesseract.recognize(dataUrl, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  };
}
