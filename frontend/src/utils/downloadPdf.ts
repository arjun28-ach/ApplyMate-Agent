import { jsPDF } from "jspdf";

import type { AnalyseResponse } from "../types";
import { parseTechnicalAnalysis } from "../components/TechnicalAnalysis";

type DownloadPdfInput = {
  result: AnalyseResponse;
  matchLevel: string;
  suggestedCvBullets: string[];
  coverLetterAngle: string;
};

function writeWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 7;
}

export function downloadPdfReport({
  result,
  matchLevel,
  suggestedCvBullets,
  coverLetterAngle
}: DownloadPdfInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 18;
  const maxWidth = 174;
  let y = 20;

  const technicalSections = parseTechnicalAnalysis(result.finalReport);
  const technicalSummary = technicalSections
    .slice(0, 3)
    .flatMap((section) => section.items.slice(0, 2))
    .join(" ");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ApplyMate Agent Report", margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Match Score: ${result.matchScore}%`, margin, y);
  y += 7;
  doc.text(`Match Level: ${matchLevel}`, margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Matched Skills", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  y = writeWrappedText(doc, result.matchedSkills.join(", ") || "None", margin, y, maxWidth);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Missing Skills", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  y = writeWrappedText(doc, result.missingSkills.join(", ") || "None", margin, y, maxWidth);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Suggested CV Bullets", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  for (const bullet of suggestedCvBullets) {
    y = writeWrappedText(doc, `- ${bullet}`, margin, y, maxWidth);
    y += 3;
  }
  y += 3;

  doc.setFont("helvetica", "bold");
  doc.text("Cover Letter Angle", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  y = writeWrappedText(doc, coverLetterAngle, margin, y, maxWidth);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Technical Analysis Summary", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  writeWrappedText(
    doc,
    technicalSummary || "Structured technical analysis is available in the app.",
    margin,
    y,
    maxWidth
  );

  doc.save("applymate-report.pdf");
}
