import { StreamingTextResponse,OpenAIStream, experimental_StreamData } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { queryGPT } from "../../../lib/db/vectorDB";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Message } from "ai/react";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, data }: { messages: Message[]; data: {topK:number,indexName:string} } = body;
    const userMessage = messages.pop();
    if (!messages || !userMessage || userMessage.role !== "user") {
      return NextResponse.json(
        {
          error:
            "messages are required in the request body and the last message must be from the user",
        },
        { status: 400 },
      );
    }

    const addOnData=new experimental_StreamData()
    const query=userMessage.content
    const {stream,responses}=await queryGPT(messages as ChatCompletionMessageParam[],query,data.topK,data.indexName)
    const streamData=OpenAIStream(stream,{
     experimental_streamData:true,
     onFinal(){
      addOnData.close()
     }
    })
    addOnData.append({result:responses})
    return new StreamingTextResponse(streamData,{},addOnData)
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}
