import * as fs from "fs";
import {readJson} from 'fs-extra'
import { NextResponse } from "next/server";
import { getCutOffSize, parsePDF} from "@/lib/scrapper/pdfScrapper";
const maxChunkWordCount=900

export async function GET() {
  try {
    const step=1
    const cutOffdocs=50 // number of first total documents to extract
    const files = await readJson("./sample/test.json") as string[];
    const requriedFiles=files.slice((step-1)*cutOffdocs,step*cutOffdocs)
    const response=(await Promise.all(requriedFiles.map( async (file)=>{
      const res=await fetch(file)
      if(!res.ok) return []
      const bidata=Buffer.from(await res.arrayBuffer());
      const responses = (await parsePDF("",bidata));
      if(!responses?.data) return []
      return responses?.data
    }).flat())).flat()

    const queryKeywords:string[]=['Flood','Flood Risk','Drainage'] // key words to look for
    const queryRegex=new RegExp(queryKeywords.join("|"),"gi")
    const filteredResponses=response.filter(res=>queryRegex.test(res?.text))


    const chunkedResponses=filteredResponses.map(item=>{
      const wordCounts=item?.text.split(" ").length
      if(wordCounts<maxChunkWordCount) return item

      const sentences=item.text.split(/\./)
      const averageWordCounts=wordCounts/sentences.length
      const cutOffIndex=Math.floor(maxChunkWordCount/averageWordCounts)
      let step=1
      const result:typeof item[]=[]

      while((step-1)*cutOffIndex<sentences.length){
        let text=sentences.slice((step-1)*cutOffIndex,step*cutOffIndex).join(".")
        result.push({
          metadata:[...item.metadata],
          text
        })
        step++
      } 
      return result
    }).flat()

    fs.writeFileSync(`./data/extractedParagraphs.json`, JSON.stringify(chunkedResponses));
    return NextResponse.json({ data: "done" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ messgae: "hel;lo" });
  }
}

