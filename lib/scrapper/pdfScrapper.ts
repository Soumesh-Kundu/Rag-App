import * as MuPDF from "mupdf/mupdfjs";
import { cleanData, CleanData } from "./dataCleaning";

type Block = {
  type: string | "text" | "image";
  bbox: { x: number; y: number; w: number; h: number };
  lines: Line[];
};
type Line = {
  wmode: number;
  bbox: { x: number; y: number; w: number; h: number };
  text: string;
  x: number;
  y: number;
  font: Font;
};
type Font = {
  name: string;
  size: number;
  family: string;
  weight: string | "normal" | "bold";
  style: string | "normal" | "italic";
};

function getCutOffSize(pdfDoc: MuPDF.PDFDocument): number {
  let fontSizes: { [key: number]: number } = {};
  for (let i = 0; i < pdfDoc.countPages(); i++) {
    const page = new MuPDF.PDFPage(pdfDoc, i);
    const { blocks } = JSON.parse(
      page.toStructuredText("preserve-whitespace").asJSON()
    ) as { blocks: Block[] }; // Extract text
    const lines = blocks.flatMap((block) => block.lines);
    for (let line of lines) {
      if (line.text.trim() === "") continue;
      const size = line.font.size;
      if (fontSizes[size]) {
        fontSizes[size]++;
      } else {
        fontSizes[size] = 1;
      }
    }
  }
  let sortedFontSizes = Object.entries(fontSizes).sort(
    (a, b) => parseFloat(a[0]) - parseFloat(b[0])
  );
  let contentFontSize = parseFloat(sortedFontSizes[0][0]);
  const SIGNIFICANT_DIFFERENCE = 0.5; // Adjust this threshold as needed

  for (let i = 1; i < sortedFontSizes.length; i++) {
    let prevSize = parseFloat(sortedFontSizes[i - 1][0]);
    let currentOccurrence = sortedFontSizes[i][1];
    let prevOccurrence = sortedFontSizes[i - 1][1];

    if (currentOccurrence < prevOccurrence * (1 - SIGNIFICANT_DIFFERENCE)) {
      contentFontSize = prevSize;
      break;
    }
  }

  return contentFontSize;
}

function isHeader(
  line: [Line | null, Line, Line | null],
  cutOffFontsize: number
) {
  const [prevLine, currentLine, nextLine] = line;

  const isLargeFont = (currentLine?.font?.size as number) >= cutOffFontsize;
  const isSignficantLargeFont =
    (currentLine?.font?.size as number) >= cutOffFontsize * 1.3;
  const isBold = currentLine.font.weight === "bold";

  // Check surrounding context
  // Heuristic checks
  const hasSpacingAbove = prevLine && currentLine.bbox.y - prevLine.y > 10;
  const hasSpacingBelow = nextLine && nextLine.bbox.y - currentLine.y > 10;
  const isIsolated = hasSpacingAbove || hasSpacingBelow;

  if (isSignficantLargeFont || (isLargeFont && isBold && isIsolated)) {
    return true;
  }
  return false;
}

export async function parsePDF(
  filename: string,
  fileBuffer: Buffer
): Promise<{ filename: string; data: CleanData[] } | undefined> {
  try {
    const pdfDoc = MuPDF.PDFDocument.openDocument(
      fileBuffer,
      "application/pdf"
    );
    let currentHeadings: { text: string; fontsize: number }[] = [];
    let currentContent: string = "";
    let result: CleanData[] = [];
    const cutOffFontsize = getCutOffSize(pdfDoc);

    for (let pageNum = 0; pageNum < pdfDoc.countPages(); pageNum++) {
      const page = new MuPDF.PDFPage(pdfDoc, pageNum);
      const textContent = JSON.parse(
        page.toStructuredText("preserve-whitespace").asJSON()
      ) as { blocks: Block[] }; // Extract text
      const lines = textContent.blocks.flatMap((block) => block.lines);
      let currentLine = null;
      let prevLine = null;
      let nextLine = null;
      let index = 0;
      do {
        currentLine = lines[index];
        if (currentLine.text.trim() === "") {
          index++;
          continue;
        }
        if (isHeader([prevLine, currentLine, nextLine], cutOffFontsize)) {
          if (currentHeadings.length > 0) {
            if (currentContent.trim() !== "") {
              const pushedData = {
                metadata: currentHeadings.map((item) => item.text),
                text: currentContent.trim(),
              };
              result.push(pushedData);
            }
            currentContent = "";
            let lastHeading = currentHeadings.pop() as {
              text: string;
              fontsize: number;
            };
            while (
              currentHeadings.length > 0 &&
              lastHeading.fontsize <= currentLine.font.size
            ) {
              lastHeading = currentHeadings.pop() as {
                text: string;
                fontsize: number;
              };
            }
            currentHeadings.push(lastHeading);
            currentHeadings.push({
              text: currentLine.text.trim(),
              fontsize: currentLine.font.size,
            });
          } else {
            currentHeadings.push({
              text: currentLine.text.trim(),
              fontsize: currentLine.font.size,
            });
          }
        } else {
          currentContent += " " + currentLine.text;
        }
        prevLine = currentLine;
        nextLine = lines[index + 1];
        index++;
      } while (index < lines.length);
    }
    if (currentContent.trim() !== "") {
      result.push({
        metadata: currentHeadings.map((item) => item.text),
        text: currentContent.trim(),
      });
    }
    result = cleanData(result);
    return {filename,data:result};
  } catch (error) {
    console.log(error);
  }
}