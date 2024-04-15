import { NextResponse } from "next/server";
import PDFParser from "pdf2json";
import * as fs from "fs";

import {
  cleanData,
} from "../cleaner/index.mjs";
// (async ()=>{const dataBuffer=fs.readFileSync('./sample/new.pdf')
// const data = await pdf(dataBuffer)
// const text = data.text
// console.log(text)})()
export async function GET() {
  const pdfreader = new PDFParser();
  try {
    const filename = fs.readdirSync("./sample")[0];
    let result: { text: string; size: number }[] = [];
    pdfreader.loadPDF(`./sample/${filename}`);
    pdfreader.on("pdfParser_dataReady", (data) => {
      let sameheading = { text: "", size: 0 };
      let prevheadY = 0;
      let parsedJson = [];
      let lastTextSize = 0;
      let content: { metadata: string[]; text: string } = {
        metadata: [],
        text: "",
      };
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
      const cutOffFontsize = parseInt(maxFontSize[0]);
      for (let page of data.Pages) {
        for (let text of page.Texts) {
          const [face, size, bold, italic] = text.R[0].TS;
          if (size > cutOffFontsize && bold === 1) {
            const heading = decodeURIComponent(text.R[0].T);
            if (lastTextSize < size) {
              content.metadata = result
                .filter((item) => item.text.trim().length)
                .map((item) => item.text.replaceAll(/\s+/g, " "));
              parsedJson.push(content);
              while (result.length && result[result.length - 1].size <= size) {
                const random = result.pop();
              }
              content = { metadata: [], text: "" };
            }
            if (text.y !== prevheadY) {
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
        content.metadata = content.metadata = result
          .filter((item) => item.text.trim().length)
          .map((item) => item.text.replaceAll(/\s+/g, " "));
        result = [];
        parsedJson.push(content);
      }
      parsedJson = parsedJson.filter((item) => item.text.trim().length > 0);
      parsedJson = cleanData(parsedJson);
      fs.writeFileSync(
        `./result/${filename.split(".")[0]}.json`,
        JSON.stringify(parsedJson)
      );
      console.log("done parsing")
    });

    return NextResponse.json({ message: "hello world" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ messgae: "hel;lo" });
  }
}
