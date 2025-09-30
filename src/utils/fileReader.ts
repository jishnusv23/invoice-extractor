import * as fs from "fs";
import * as path from "path";
import pdfParse from "pdf-parse";

/**
 * Read invoice file and convert to base64 data URL
 */
export function readInvoiceFileAsBase64(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  validateFileType(filePath);

  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");
  const mimeType = getMimeType(filePath);

  return `data:${mimeType};base64,${base64Data}`;
}

// Get MIME type based on file extension
 
export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };

  const mimeType = mimeTypes[ext];
  if (!mimeType) {
    throw new Error(
      `Unsupported file type: ${ext}. Supported: .jpg, .jpeg, .png, .gif, .webp, .pdf`
    );
  }

  return mimeType;
}

//Check if file is a PDF
export function isPDF(filePath: string): boolean {
  return path.extname(filePath).toLowerCase() === ".pdf";
}

// Check if file is an image

export function isImage(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
}

// Validate file type

export function validateFileType(filePath: string): void {
  const ext = path.extname(filePath).toLowerCase();
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"];

  if (!validExtensions.includes(ext)) {
    throw new Error(
      `Invalid file type: ${ext}. Supported: ${validExtensions.join(", ")}`
    );
  }
}

//Extract text from PDF
 
export async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(fileBuffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("PDF appears to be empty or contains only images");
    }
    return data.text;
  } catch (error: any) {
    throw new Error(`Failed to extract text from PDF: ${error?.message}`);
  }
}

