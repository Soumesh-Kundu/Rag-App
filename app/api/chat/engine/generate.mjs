import {
  serviceContextFromDefaults,
  storageContextFromDefaults,
  VectorStoreIndex,
  Document
} from "llamaindex";

import * as dotenv from "dotenv";

import { CHUNK_OVERLAP, CHUNK_SIZE, STORAGE_CACHE_DIR } from "./constants.mjs";
import { getDocuments } from "./loader.mjs";
import { readFile } from "fs/promises";
import { readFileSync } from "fs";

// Load environment variables from local .env file
dotenv.config();

async function getRuntime(func) {
  const start = Date.now();
  await func();
  const end = Date.now();
  return end - start;
}

export async function generateDatasource(serviceContext) {
  console.log(`Generating storage context...`);
  // Split documents, create embeddings and store them in the storage context
  const ms = await getRuntime(async () => {
    const storageContext = await storageContextFromDefaults({
      persistDir: STORAGE_CACHE_DIR,
    });
    try {
      const documents = await getDocuments();
      await VectorStoreIndex.fromDocuments(documents, {
        storageContext,
        serviceContext,
      });
    } catch (error) {
      console.log(error)
    }
  });
  console.log(`Storage context successfully generated in ${ms / 1000}s.`);
}

export async function BuildVectorData() {
  const serviceContext = serviceContextFromDefaults({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  await generateDatasource(serviceContext);
  console.log("Finished generating storage.");
};
await BuildVectorData()