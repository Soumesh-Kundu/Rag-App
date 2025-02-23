"use server";
import { pcDB } from "@/lib/db/vectorDB";
const indexName = process.env.PINECONE_INDEX_NAME!;
export async function deleteNamespace(id: string) {
  const namespace = id;
  try {
    let index = pcDB.index(indexName);
    const ns = index.namespace(namespace);
    ns.deleteAll();
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}
