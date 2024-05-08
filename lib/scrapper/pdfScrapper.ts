import pdfParser, { Output } from "pdf2json";
import { CleanData, cleanData } from "./dataCleaning";


export function getCutOffSize(data: Output): number {
  let fontSizes: { [key: number]: number } = {};
  for (let page of data.Pages) {
    for (let text of page.Texts) {
      const size = text.R[0].TS[1];
      if (fontSizes[size]) {
        fontSizes[size]++;
      } else {
        fontSizes[size] = 1;
      }
    }
  }
  let maxFontSize: [string, number] = ["0", 0];
  for (let [key, value] of Object.entries(fontSizes)) {
    if (value > maxFontSize[1]) {
      maxFontSize[0] = key;
      maxFontSize[1] = value;
    }
  }
  return parseFloat(maxFontSize[0]);
}

export async function parsePDF(
  filename: string,
  biData: Buffer
): Promise<{ filename: string; data: CleanData[] } | undefined> {
  const pdfreader = new pdfParser();
  const ThressholdWordCount=parseInt(process.env.THRESSHOLD_WORD_COUNT as string) ?? 100
  try {
    const res: { filename: string; data: CleanData[] } = await new Promise(
      (resolve, reject) => {
        let result: { text: string; size: number }[] = [];
        pdfreader.parseBuffer(biData);
        pdfreader.on("pdfParser_dataError", (err) => {
          reject(err);
        });
        pdfreader.on("pdfParser_dataReady", (data) => {
          let sameheading = { text: "", size: 0 };
          let prevheadY = 0;
          let parsedJson: CleanData[] = [];
          let lastTextSize = 0;
          let content: CleanData = {
            metadata: [],
            text: "",
          };
          const cutOffFontsize = getCutOffSize(data);
          for (let page of data.Pages) {
            for (let text of page.Texts) {
              const [face, size, bold, italic] = text.R[0].TS;
              if (size > cutOffFontsize) {
                const heading = decodeURIComponent(text.R[0].T);
                if (lastTextSize < size) {
                  content.metadata = result
                    .filter(
                      (item) =>
                        !/^\d+$/.test(item.text) &&
                        item.text.trim().length !== 0
                    )
                    .map((item) => item.text.replaceAll(/\s+/g, " "));
                  parsedJson.push(content);
                  while (
                    result.length &&
                    result[result.length - 1].size <= size
                  ) {
                    result.pop();
                  }
                  content = { metadata: [], text: "" };
                }
                if (text.y !== prevheadY && /^[A-Z0-9]/.test(heading)) {
                  if (sameheading.text.length) {
                    result.push(sameheading);
                  }
                  sameheading = { text: heading, size: size };
                } else {
                  sameheading.text += heading;
                }
                prevheadY = text.y;
              } else {
                if (sameheading.text.length) {
                  result.push(sameheading);
                  sameheading = { text: "", size: 0 };
                }
                content.text += decodeURIComponent(text.R[0].T);
              }
              lastTextSize = size;
            }
          }
          if (content.text.length) {
            content.metadata = result
              .filter((item) => item.text.trim().length)
              .map((item) => item.text.replaceAll(/\s+/g, " "));
            result = [];
            parsedJson.push(content);
          }
          parsedJson = parsedJson.filter((item) => item.text.trim().length > 0);
          parsedJson = cleanData(parsedJson);
          content={metadata: [], text: ""}
          const filtered = parsedJson.reduce((acc:CleanData[], item,index) => {
            const currentWordCount = content.text.split(" ").length;
            if (currentWordCount > ThressholdWordCount) {
              acc.push(content);
              content=item
              return acc
            }
            content.text += item.text + " ";
            content.metadata=Array.from(new Set([...content.metadata,...item.metadata]));
            if(index+1>=parsedJson.length){
              acc.push(content)
            }
            return acc
          },[]);
          resolve({ filename, data: filtered });
        });
      }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
}
