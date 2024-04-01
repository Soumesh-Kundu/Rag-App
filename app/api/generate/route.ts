import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readdir, unlink, rmdir } from "fs/promises";
import { writeFileSync, existsSync } from "fs";
import { BuildVectorData, generateDatasource } from "../chat/engine/generate.mjs";
import { revalidatePath } from "next/cache";
async function DeleteFiles(paths: string[]) {
  const DeletePromise: Promise<void>[] = [];
  for (let path of paths) {
    if (!existsSync(process.cwd() + `/${path}`)) {
      continue;
    }
    let documents = await readdir(process.cwd() + `/${path}`);
    for (let document of documents) {
      DeletePromise.push(unlink(process.cwd() + `/${path}/${document}`));
    }
  }
  try {
    await Promise.all(DeletePromise);
    if (existsSync(process.cwd() + "/cache")) {
      await rmdir(process.cwd() + "/cache");
    }
  } catch (error) {
    console.log(error);
  }
}
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  console.log(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  //   const filename =  file.name.replaceAll(" ", "_");
  //   console.log(filename);
  try {
    await DeleteFiles(["cache", "data"]);
    writeFileSync(path.join(process.cwd(), "/data/" + file.name), buffer);
    await BuildVectorData()
    revalidatePath('/')
    return NextResponse.json({ Message: "Success", status: 201 });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
}
