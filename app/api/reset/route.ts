import { createDocIndex, deleteDocIndex, pcInbox } from "@/lib/db/vectorDB";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
const {indexName}=await request.json()
  let indexExists = (await pcInbox.listIndexes()).indexes?.some(
    (index) => index.name === indexName
  );
  try {
    if (indexExists) {
      await deleteDocIndex(indexName);
    }
    await createDocIndex(indexName);
    return NextResponse.json({success:true})
  } catch (error) {
    console.log(error);
    return NextResponse.json({error:"internal server error"},{status:500})
  }
}
