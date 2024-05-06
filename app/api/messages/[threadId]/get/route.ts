import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prismaDB";
import { inboxConfig, isInbox } from "@/lib/db/vectorDB";
export async function GET(request:NextRequest,{params}:{params:{threadId:string}}) {
    try {
        const threadID=isInbox(params.threadId)?inboxConfig.get(params.threadId)?.threadID:params.threadId
        const data=await db.messages.findMany({
            where:{
                threadID
            },
            orderBy:{
                createdAt:'asc'
            }
        })
        return NextResponse.json({messages:data,success:true},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"internal Server Error"},{status:500})
    }
}