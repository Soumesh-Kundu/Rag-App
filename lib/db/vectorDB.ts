import { Pinecone } from "@pinecone-database/pinecone";
import { EmbeddingData } from "@/lib/scrapper/dataCleaning";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import {
  CreateIndexRequestMetricEnum,
  ServerlessSpecCloudEnum,
} from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

const openai = new OpenAI({});
export const pcRepo = new Pinecone({
  apiKey: process.env.PINECONE_REPO_API_KEY as string,
});
export const pcInbox = new Pinecone({
  apiKey: process.env.PINECONE_INBOX_API_KEY as string,
});

export const inboxConfig=new Map([
  ['gmail',({indexName:process.env.PINECONE_GMAIL_INDEX_NAME as string,namespace:process.env.PINECONE_GMAIL_NAMESPACE ,threadID:"663657d1e96fbf822661f17e"})],
  ['hotmail',({indexName:process.env.PINECONE_HOTMAIL_INDEX_NAME as string,namespace:process.env.PINECONE_HOTMAIL_NAMESPACE ,threadID:"663657d1e96fbf822661f17f"})],
  ['zoho',({indexName:process.env.PINECONE_ZOHO_INDEX_NAME as string,namespace:process.env.PINECONE_ZOHO_NAMESPACE ,threadID:"66326e94b1c1156c4c78992b"})],
])
export const config = {
  similarityQuery: {
    // Top results limit
    includeValues: false, // Exclude vector values
    includeMetadata: true, // Include metadata
  },
  namespace: process.env.PINECONE_NAMESPACE as string, // Pinecone namespace
  indexName: process.env.PINECONE_INDEX_NAME as string, // Pinecone index name
  embeddingID: "id", // Embedding identifier
  dimension: 1536, // Embedding dimension
  metric: CreateIndexRequestMetricEnum.Cosine, // Similarity metric
  cloud: ServerlessSpecCloudEnum.Aws, // Cloud provider
  region: "us-east-1", // Serverless region
};

export function delay(t: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t * 1000);
  });
}

export async function upsertData(dataToEmbed: EmbeddingData[],indexName:string) {
  try {
    let step = 1;
    const cutOffIndex = 15;
    do {
      await Promise.all(
        dataToEmbed
          .slice(
            (step - 1) * cutOffIndex,
            Math.min(step * cutOffIndex, dataToEmbed.length)
          )
          .map(async (item) => {
            const embedding = await openai.embeddings.create({
              model: "text-embedding-ada-002",
              input: `${item.keywords.join("|")}-\n${item.textToEmbed}`,
            });
            // 12. Define index name and unique ID for each embedding
            const id = `${indexName.slice(0,4)}-${config.embeddingID}-${item.id}`;
            // 13. Upsert embedding into Pinecone with new metadata
            await pcRepo
              .index(indexName)
              .namespace(config.namespace)
              .upsert([
                {
                  id: id,
                  values: embedding.data[0].embedding,
                  metadata: {
                    headings: item.keywords,
                    content: item.textToEmbed,
                  },
                },
              ]);
          })
      );
      step++;
    } while ((step - 1) * cutOffIndex < dataToEmbed.length);
    console.log("done");
  } catch (error) {
    console.log(error);
  }
}

function getContent(item: string | number | boolean | string[]) {
  if (typeof item === "object") {
    return item.join("|");
  }
  return item;
}
export function isInbox(name:string){
  return /gmail|hotmail|zoho/.test(name)
}
export async function queryGPT(
  messages: ChatCompletionMessageParam[],
  query: string,
  topK: number,
  indexName:string
) {
  // 16. Create query embedding using OpenAI
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });
  // 17. Perform the query
  const pc=isInbox(indexName)?pcInbox:pcRepo
  const index=isInbox(indexName)?inboxConfig.get(indexName)?.indexName:indexName
  const namespace=isInbox(indexName)?inboxConfig.get(indexName)?.namespace:config.namespace
  const queryResult = await pc
    .index(index as string)
    .namespace(namespace as string)
    .query({
      ...config.similarityQuery,
      topK: topK,
      vector: queryEmbedding.data[0].embedding,
    });
  const content = queryResult.matches
    .map((item) => {
      return (
        Object.entries(item.metadata as object).reduce((acc, [key, item]) => {
          return acc + `\n${key}:${getContent(item)}`;
        }, "") + "\n"
      );
    }) 
    .join("---");
  const prompt = `
  hello please answer the question from the given context below in the following Context Section. answer the question using only that information make it more human like with your creativity. If you are unsure and the answer is not written in the Context try to answer withthe previous messages otherwise say Apolgies appropiately but don't make it too long and Please do not write URLs that you cannot find in the context section

  Context Section:
  ${content}

  Question:
  """
  ${query}
  """
  `;
  const stream = await openai.chat.completions.create({
    model: process.env.MODEL as string,
    messages: [
      ...messages,
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
    temperature: 0.5,
  });
  // 18. Log query results
  return {
    stream,
    responses: queryResult.matches.map((item) => ({
      text:
        Object.entries(item.metadata as object).reduce((acc, [key, item]) => {
          return acc + `${key}:${getContent(item)}\n`;
        }, "") + "\n",
      score: item.score as number,
    })),
  };
}

export async function createDocIndex(indexName: string,safetyCheck:boolean=false) {
  if (safetyCheck ) {
    let indexExists = (await pcRepo.listIndexes()).indexes?.some(
      (index) => index.name === indexName
    );
    if (indexExists) return
    // console.log("index already exists");
    return;
  }
  await pcRepo.createIndex({
    name: indexName,
    dimension: config.dimension,
    metric: config.metric,
    spec: { serverless: { cloud: config.cloud, region: config.region } },
  });
  console.log("index created");
}
export async function deleteDocIndex(indexName: string,safetyCheck:boolean=false) {
  if (safetyCheck) {
    let indexExists = (await pcRepo.listIndexes()).indexes?.some(
      (index) => index.name === indexName
    );
    if(!indexExists) return;
  }
  await pcRepo.deleteIndex(indexName);
  console.log("index deleted");
}
