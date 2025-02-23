import { Pinecone } from "@pinecone-database/pinecone";
import { EmbeddingData } from "@/lib/scrapper/dataCleaning";
import {
  CreateIndexRequestMetricEnum,
  ServerlessSpecCloudEnum,
} from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import { google as GenAi } from "@ai-sdk/google";
import { generateText, embed, streamText } from "ai";
import { Message } from "ai";

// const genAi = new GoogleGenerativeAI(process.env.NEXT_GEMINI_API_KEY!);
const embeddingModel = GenAi.textEmbeddingModel("text-embedding-004");
const chatModel = GenAi("gemini-2.0-flash-001");
export const pcDB = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

export const config = {
  similarityQuery: {
    // Top results limit
    includeValues: false, // Exclude vector values
    includeMetadata: true, // Include metadata
  },
  indexName: process.env.PINECONE_INDEX_NAME as string, // Pinecone index name
  embeddingID: "id", // Embedding identifier
  dimension: 768, // Embedding dimension
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

export async function upsertData(
  dataToEmbed: EmbeddingData[],
  namespace: string
) {
  try {
    let step = 1;
    const cutOffIndex = 15;
    const listOfEmbeddings = [];
    do {
      const data = await Promise.all(
        dataToEmbed
          .slice(
            (step - 1) * cutOffIndex,
            Math.min(step * cutOffIndex, dataToEmbed.length)
          )
          .map(async (item) => {
            // const embedding = await embeddingModel.embedContent(
            //   `${item.keywords.join("|")}-\n${item.textToEmbed}`
            // );
            const { embedding } = await embed({
              model: embeddingModel,
              value: `${item.keywords.join("|")}-\n${item.textToEmbed}`,
            });
            // 12. Define index name and unique ID for each embedding
            const id = `${item.id}-${config.indexName}-${config.embeddingID}-`;
            // 13. Upsert embedding into Pinecone with new metadata
            return {
              id: id,
              values: embedding,
              metadata: {
                headings: item.keywords,
                content: item.textToEmbed,
              },
            };
          })
      );
      listOfEmbeddings.push(data);
      step++;
    } while ((step - 1) * cutOffIndex < dataToEmbed.length);
    await pcDB
      .index(config.indexName)
      .namespace(namespace)
      .upsert(listOfEmbeddings.flat());
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
export function isInbox(name: string) {
  return /gmail|hotmail|zoho/.test(name);
}

const instructions = `
**Response Formatting:**
- Format the response **strictly** in **Markdown**.
- Use **headings** ('##', '###') for important sections only if neccessory and for longer answers.
- Highlight key words using **bold**.
- If explaining multiple points, use:
  - **Bullet points (-) for unordered lists.**
  - **Numbered lists (1., 2., 3.) for ordered steps.**
- Enclose **code snippets** in triple backticks (\`\`\`).
- **Do NOT include phrases** like "According to the context" or "Based on the provided information."
- Keep the answer **engaging and structured** for better readability.
- Make sure the answer is **concise and to the point** without bluffing or just throwing the context that is given. Don't just throw the context that is appropriate to the question answer, createively by summersizeing in multiple points.
- can use appropiate emojis to make the response more engaging but not too much or not in every line only when it is neccessory or appropiate.
- don't mention anything about context in response, should be answering like that you are answering from your own knowledge
`;

const omitKeys = /headings/;
export async function queryGPT(
  messages: Message[],
  query: Message,
  topK: number,
  nameSpace: string,
  isRag: boolean
) {
  // 16. Create query embedding using OpenAI
  const queryEmbedding = await embed({
    model: embeddingModel,
    value: query.content,
  });
  // 17. Perform the query
  const pc = pcDB;
  const index = config.indexName;
  const namespace = nameSpace;
  let prompt;
  if (!isRag) { 
    prompt=`
    Anwser the users question appropiately in a friendly manner with you knowledge

    ${instructions}

    **Question:**  
    """
    ${query.content}
    """
    `
    const stream = streamText({
      model: chatModel,
      messages: [
        ...messages,
        {
          content: prompt,
          role: query.role,
        },
      ],
    });
    return {
      stream,
      responses: [],
    }
  }
  let queryResult = await pc
    .index(index as string)
    .namespace(namespace as string)
    .query({
      ...config.similarityQuery,
      topK: topK,
      vector: queryEmbedding.embedding,
    });
  let errorCount = 1;
  let data = queryResult.matches;
  while (queryResult.matches.length !== 0) {
    try {
      const content = queryResult.matches
        .map((item) => {
          return (
            Object.entries(item.metadata as object).reduce(
              (acc, [key, item]) => {
                return acc + `\n${key}:${getContent(item)}`;
              },
              ""
            ) + "\n"
          );
        })
        .join("---");
      prompt = `
  You are an AI assistant that answers questions using only the provided context.
      
${instructions}

**Context Section:**  
${content}  

**Question:**  
"""  
${query.content}  
"""
`;

      const stream = streamText({
        model: chatModel,
        messages: [...messages, { content: prompt, role: query.role }],
      });
      // 18. Log query results

      return {
        stream,
        responses: data.map((item) => ({
          text:
            Object.entries(item.metadata as object).reduce(
              (acc, [key, item]) => {
                if (omitKeys.test(key)) return acc;
                return acc + `${key}:${getContent(item)}\n`;
              },
              ""
            ) + "\n",
          score: item.score as number,
        })),
      };
    } catch (error) {
      console.log(error);
      queryResult.matches = queryResult.matches.slice(
        0,
        queryResult.matches.length - (Math.floor(errorCount / 2) + 2)
      );
    }
  }

  const stream = streamText({
    model: chatModel,
    messages: [
      ...messages,
      {
        content: "answer only that you can't properly answer that question",
        role: query.role,
      },
    ],
  });
  return {
    stream,
    responses: data.map((item) => ({
      text:
        Object.entries(item.metadata as object).reduce((acc, [key, item]) => {
          if (omitKeys.test(key)) return acc;
          return acc + `${key}:${getContent(item)}\n`;
        }, "") + "\n",
      score: item.score as number,
    })),
  };
}

export async function createDocIndex(safetyCheck: boolean = false) {
  if (safetyCheck) {
    let indexExists = (await pcDB.listIndexes()).indexes?.some(
      (index) => index.name === config.indexName
    );
    if (indexExists) {
      return;
    }
  }
  await pcDB.createIndex({
    name: config.indexName,
    dimension: config.dimension,
    metric: config.metric,
    spec: { serverless: { cloud: config.cloud, region: config.region } },
  });
}
export async function deleteDocIndex(safetyCheck: boolean = false) {
  if (safetyCheck) {
    let indexExists = (await pcDB.listIndexes()).indexes?.some(
      (index) => index.name === config.indexName
    );
    if (!indexExists) return;
  }
  await pcDB.deleteIndex(config.indexName);
}
