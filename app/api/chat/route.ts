import { createDataStreamResponse, pipeDataStreamToResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { queryGPT } from "../../../lib/db/vectorDB";
import { Message } from "ai/react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      data,
    }: { messages: Message[]; data: { topK: number; indexName: string } } =
      body;
    const userMessage = messages.pop() as Message;
    const isRag=/^```\/doc```/.test(userMessage?.content);
    userMessage.content=userMessage.content.replace(/^```\/doc```/,'');
    if (!messages || !userMessage || userMessage.role !== "user") {
      return NextResponse.json(
        {
          error:
            "messages are required in the request body and the last message must be from the user",
        },
        { status: 400 }
      );
    }

    const query = userMessage;
    const { stream, responses } = await queryGPT(
      messages,
      query,
      data.topK,
      data.indexName,
      isRag
    );
    const res = createDataStreamResponse({
      async execute(dataStream) {
        dataStream.writeData({result:responses});
        stream.mergeIntoDataStream(dataStream)
      },
    });
    // addOnData.append({result:responses})
    // return new StreamingTextResponse(streamData,{},addOnData)
    return res;
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      }
    );
  }
}
