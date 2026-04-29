import pdfParse from "pdf-parse";

const TXT_MIME_TYPES = new Set(["text/plain"]);
const PDF_MIME_TYPES = new Set(["application/pdf"]);

function normaliseText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex >= 0 ? filename.slice(lastDotIndex).toLowerCase() : "";
}

export async function parseUploadedFile(file: Express.Multer.File): Promise<string> {
  const extension = getFileExtension(file.originalname);

  if (extension === ".txt" || TXT_MIME_TYPES.has(file.mimetype)) {
    const text = normaliseText(file.buffer.toString("utf8"));

    if (!text) {
      throw new Error("The uploaded .txt file is empty.");
    }

    return text;
  }

  if (extension === ".pdf" || PDF_MIME_TYPES.has(file.mimetype)) {
    try {
      const result = await pdfParse(file.buffer);
      const text = normaliseText(result.text);

      if (!text) {
        throw new Error("The uploaded .pdf file did not contain extractable text.");
      }

      return text;
    } catch (error) {
      if (error instanceof Error && error.message.includes("did not contain extractable text")) {
        throw error;
      }

      throw new Error("Failed to parse the uploaded PDF file.");
    }
  }

  throw new Error("Unsupported CV format. Please upload a .txt or .pdf file.");
}
