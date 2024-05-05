import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prismaDB";
export async function GET(request:NextRequest,{params}:{params:{threadId:string}}) {
    try {
        const data=await db.messages.findMany({
            where:{
                threadID:params.threadId
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