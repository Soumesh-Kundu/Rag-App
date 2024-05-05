import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { parsePDF } from "@/lib/scrapper/pdfScrapper";
import { extractKeyword } from "@/lib/scrapper/dataCleaning";
import { createDocIndex, pc, upsertData } from "@/lib/db/vectorDB";
import { config } from "@/lib/db/vectorDB";
type FileInstance = {
  arrayBuffer: () => Promise<Buffer>;
  name: string;
};
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  let files = formData.getAll("files") as unknown as FileInstance[];
  const indexName=formData.get('threadId') as string
  if (!files.length) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }
  const extractedFiles: { filename: string; buffer: Buffer }[] = [];
  for (let file of files) {
    extractedFiles.push({
      filename: file.name.split(".")[0],
      buffer: Buffer.from(await file.arrayBuffer()),
    });
  }
  try {
    const parsedData = await Promise.all(
      extractedFiles.map(({ filename, buffer }) => parsePDF(filename, buffer))
    );
    let data = parsedData.flatMap((doc) => extractKeyword(doc));
    let indexExists = (await pc.listIndexes()).indexes?.some(
      (index) => index.name === indexName
    );
    if (!indexExists) {
      await createDocIndex(indexName)
    }
    await upsertData(data,indexName);
    revalidatePath("/");
    return NextResponse.json({ Message: "Success", status: 201 });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
}
