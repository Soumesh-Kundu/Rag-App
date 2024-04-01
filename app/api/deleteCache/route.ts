import { existsSync } from "fs";
import { readdir, rmdir, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

async function removeCache(): Promise<void> {
  const DeletePromise: Promise<void>[] = [];
  const CACHE_PATH=process.cwd() + "/cache"
  if (!existsSync(CACHE_PATH)) {
    return;
  }
  let documents = await readdir(CACHE_PATH);
  for (let document of documents) {
    DeletePromise.push(unlink(`${CACHE_PATH}/${document}`));
  }

  try {
    await Promise.all(DeletePromise);
    await rmdir(CACHE_PATH);
  } catch (error) {
    console.log(error);
  }
}
export async function DELETE(request:NextRequest) {
    try {
        await removeCache()
        return NextResponse.json({message:"cache cleared"},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:error},{status:400})
    }
}
