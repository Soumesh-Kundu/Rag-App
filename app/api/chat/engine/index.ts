import {
  ContextChatEngine,
  LLM,
  serviceContextFromDefaults,
  SimpleDocumentStore,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { CHUNK_OVERLAP, CHUNK_SIZE, STORAGE_CACHE_DIR } from "./constants.mjs";
import { initVectorDB } from "../../generate/vectorDB";

async function getDataSource(llm: LLM) {
  const serviceContext = serviceContextFromDefaults({
    llm,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  const vectorStore=initVectorDB()
  const storageContext = await storageContextFromDefaults({
    vectorStore:vectorStore
  });

  return await VectorStoreIndex.fromVectorStore(vectorStore,serviceContext);
}

export async function createChatEngine(llm: LLM) {
  const index = await getDataSource(llm);
  const retriever = index.asRetriever();
  retriever.similarityTopK = 3;

  return new ContextChatEngine({
    chatModel: llm,
    retriever,
  });
}
