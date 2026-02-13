import { jsPDF } from "jspdf";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EvaluationPdfOptions {
  reportText: string;
  candidateName: string;
  /** "student" shows a strength bar; "sales" omits it */
  reportType: "student" | "sales";
  /** Vite asset URL for logo-blue.png */
  logoUrl: string;
}

// ---------------------------------------------------------------------------
// Logo cache – fetched once, reused across calls
// ---------------------------------------------------------------------------

let cachedLogo: { base64: string; aspectRatio: number } | null = null;

async function loadLogo(url: string): Promise<{ base64: string; aspectRatio: number }> {
  if (cachedLogo) return cachedLogo;

  const response = await fetch(url);
  const blob = await response.blob();

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const aspectRatio = await new Promise<number>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
    img.onerror = reject;
    img.src = base64;
  });

  cachedLogo = { base64, aspectRatio };
  return cachedLogo;
}

// ---------------------------------------------------------------------------
// Strength helpers
// ---------------------------------------------------------------------------

function parseStrength(reportText: string): {
  label: string;
  percent: number;
} | null {
  const match = reportText.match(/^Overall Strength Rating:\s*(.+)$/im);
  if (!match) return { label: "Not specified", percent: 50 };

  const raw = match[1].trim();
  const lower = raw.toLowerCase();

  if (lower.includes("strong")) return { label: raw, percent: 90 };
  if (lower.includes("high")) return { label: raw, percent: 80 };
  if (lower.includes("buildable")) return { label: raw, percent: 65 };
  if (lower.includes("early")) return { label: raw, percent: 45 };

  return { label: raw, percent: 50 };
}

// ---------------------------------------------------------------------------
// Text block parser
// ---------------------------------------------------------------------------

interface TextBlock {
  type: "heading" | "bullet" | "paragraph";
  text: string;
}

function parseReportBlocks(reportText: string, isStudent: boolean): TextBlock[] {
  const lines = reportText.split("\n");
  const blocks: TextBlock[] = [];
  let paragraphBuffer = "";

  const flushParagraph = () => {
    if (paragraphBuffer.trim()) {
      blocks.push({ type: "paragraph", text: paragraphBuffer.trim() });
    }
    paragraphBuffer = "";
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines – they just break paragraphs
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Skip meta lines already displayed in the header
    if (/^(Student Profile Assessment|Sales Screening Report)\s*$/i.test(trimmed)) continue;
    if (/^Candidate:\s*/i.test(trimmed)) continue;
    if (isStudent && /^Overall Strength Rating:\s*/i.test(trimmed)) continue;

    // Numbered headings: "1. Section Name" or "10. Section Name"
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: "heading", text: trimmed });
      continue;
    }

    // Bullet points
    if (/^[-•]\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: "bullet", text: trimmed.replace(/^[-•]\s+/, "") });
      continue;
    }

    // Regular text – accumulate into a paragraph
    paragraphBuffer += (paragraphBuffer ? " " : "") + trimmed;
  }
  flushParagraph();
  return blocks;
}

// ---------------------------------------------------------------------------
// Page layout constants (mm)
// ---------------------------------------------------------------------------

const PAGE_W = 210; // A4 width
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const MARGIN_TOP = 15;
const MARGIN_BOTTOM = 20;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;
const LOGO_W = 35;

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function getLogoH(aspectRatio: number) {
  return LOGO_W / aspectRatio;
}

function getHeaderRuleY(aspectRatio: number) {
  return MARGIN_TOP + getLogoH(aspectRatio) + 4;
}

function getContentStartY(aspectRatio: number) {
  return getHeaderRuleY(aspectRatio) + 6;
}

function drawPageHeader(doc: jsPDF, logoBase64: string, aspectRatio: number) {
  const logoH = getLogoH(aspectRatio);
  doc.addImage(logoBase64, "PNG", MARGIN_LEFT, MARGIN_TOP, LOGO_W, logoH);
  const ruleY = getHeaderRuleY(aspectRatio);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_LEFT, ruleY, PAGE_W - MARGIN_RIGHT, ruleY);
}

function addPageNumbers(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Page ${i} of ${totalPages}`,
      PAGE_W / 2,
      297 - MARGIN_BOTTOM / 2,
      { align: "center" },
    );
  }
}

function ensureSpace(
  doc: jsPDF,
  cursorY: number,
  needed: number,
  logoBase64: string,
  aspectRatio: number,
): number {
  const maxY = 297 - MARGIN_BOTTOM;
  if (cursorY + needed > maxY) {
    doc.addPage();
    drawPageHeader(doc, logoBase64, aspectRatio);
    return getContentStartY(aspectRatio);
  }
  return cursorY;
}

// ---------------------------------------------------------------------------
// Rounded-rect helper (jsPDF's roundedRect draws stroke; we fill manually)
// ---------------------------------------------------------------------------

function fillRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  doc.roundedRect(x, y, w, h, r, r, "F");
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateEvaluationPdf(opts: EvaluationPdfOptions) {
  const { reportText, candidateName, reportType, logoUrl } = opts;

  const logo = await loadLogo(logoUrl);
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ---- First page header + logo ----
  drawPageHeader(doc, logo.base64, logo.aspectRatio);

  let y = getContentStartY(logo.aspectRatio);

  // ---- Title ----
  const title =
    reportType === "student"
      ? "Student Profile Assessment"
      : "Sales Screening Report";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text(title, MARGIN_LEFT, y);
  y += 8;

  // ---- Candidate name ----
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(`Candidate: ${candidateName || "Unnamed candidate"}`, MARGIN_LEFT, y);
  y += 10;

  // ---- Strength bar (student only) ----
  if (reportType === "student") {
    const strength = parseStrength(reportText);
    if (strength) {
      const barX = MARGIN_LEFT;
      const barW = 80;
      const barH = 4;
      const radius = 2;

      // Label
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Overall Strength: `, barX, y);
      const labelWidth = doc.getTextWidth("Overall Strength: ");
      doc.setFont("helvetica", "bold");
      doc.text(strength.label, barX + labelWidth, y);
      y += 5;

      // Track (gray)
      doc.setFillColor(229, 231, 235);
      fillRoundedRect(doc, barX, y, barW, barH, radius);

      // Fill (dark)
      const fillW = (barW * strength.percent) / 100;
      if (fillW > 0) {
        doc.setFillColor(31, 41, 55);
        fillRoundedRect(doc, barX, y, fillW, barH, radius);
      }
      y += barH + 2;

      // Scale labels
      const scaleLabels = ["Early-Stage", "Buildable", "High-Potential", "Strong"];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      const segW = barW / (scaleLabels.length - 1);
      scaleLabels.forEach((label, i) => {
        const lx = barX + segW * i;
        const align: "left" | "center" | "right" =
          i === 0 ? "left" : i === scaleLabels.length - 1 ? "right" : "center";
        doc.text(label, lx, y + 3, { align });
      });
      y += 10;
    }
  }

  // ---- Report body ----
  const blocks = parseReportBlocks(reportText, reportType === "student");

  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30, 30, 30);

        const headingLines = doc.splitTextToSize(block.text, CONTENT_W) as string[];
        const headingH = headingLines.length * 5 + 4;
        y = ensureSpace(doc, y, headingH, logo.base64, logo.aspectRatio);
        y += 4; // spacing before heading
        headingLines.forEach((line: string) => {
          doc.text(line, MARGIN_LEFT, y);
          y += 5;
        });
        y += 1;
        break;
      }

      case "bullet": {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);

        const bulletIndent = 6;
        const bulletTextW = CONTENT_W - bulletIndent;
        const bulletLines = doc.splitTextToSize(block.text, bulletTextW) as string[];
        const bulletH = bulletLines.length * 4.5 + 1;
        y = ensureSpace(doc, y, bulletH, logo.base64, logo.aspectRatio);

        // Bullet character
        doc.text("\u2022", MARGIN_LEFT + 2, y);
        bulletLines.forEach((line: string, idx: number) => {
          doc.text(line, MARGIN_LEFT + bulletIndent, y + idx * 4.5);
        });
        y += bulletLines.length * 4.5 + 1;
        break;
      }

      case "paragraph": {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);

        const paraLines = doc.splitTextToSize(block.text, CONTENT_W) as string[];
        // Render line by line, checking page space for each chunk
        const lineH = 4.5;
        const chunkSize = 5; // lines per space-check
        let lineIdx = 0;
        while (lineIdx < paraLines.length) {
          const remaining = paraLines.slice(lineIdx, lineIdx + chunkSize);
          const neededH = remaining.length * lineH + 2;
          y = ensureSpace(doc, y, neededH, logo.base64, logo.aspectRatio);
          remaining.forEach((line: string) => {
            doc.text(line, MARGIN_LEFT, y);
            y += lineH;
          });
          lineIdx += chunkSize;
        }
        y += 2; // spacing after paragraph
        break;
      }
    }
  }

  // ---- Page numbers ----
  addPageNumbers(doc);

  // ---- Open in new tab ----
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl as unknown as string, "_blank");
}
