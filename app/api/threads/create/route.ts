import db from "@/lib/db/prismaDB";
import { createDocIndex } from "@/lib/db/vectorDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
    try {
        const{heading}=await request.json()
        const data=await db.threads.create({
            data:{
                heading:heading
            }
        })
        await createDocIndex(data.id)
        return NextResponse.json({message:"thread created",id:data.id},{status:201})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"internal Server Error"},{status:500})
    }
}