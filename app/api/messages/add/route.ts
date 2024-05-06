import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prismaDB";
import { inboxConfig, isInbox } from "@/lib/db/vectorDB";
type MessageBody={
    role:"USER"|'ASSISTANT'|'SYSTEM',
    content:string,
    data?:{score:number,text:string}[]
    createdAt:string
}
export async function POST(request:NextRequest) {
    try {
        const {messages,threadID }=await request.json() as {messages:MessageBody[],threadID:string}
        const threadId=isInbox(threadID)?inboxConfig.get(threadID)?.threadID as string:threadID
        await db.messages.createMany({
            data:messages.map(item=>({...item,threadID:threadId}))
        })
        return NextResponse.json({messages:"messages upserted"},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"internal Server Error"},{status:500})
    }
}